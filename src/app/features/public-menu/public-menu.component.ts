import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicMenuService, type PublicMenuResponse } from '../../core/services/public-menu.service';

const SCHEDULE_DAYS: { key: string; label: string; short: string }[] = [
  { key: 'monday', label: 'Lunes', short: 'L' },
  { key: 'tuesday', label: 'Martes', short: 'M' },
  { key: 'wednesday', label: 'Miércoles', short: 'X' },
  { key: 'thursday', label: 'Jueves', short: 'J' },
  { key: 'friday', label: 'Viernes', short: 'V' },
  { key: 'saturday', label: 'Sábado', short: 'S' },
  { key: 'sunday', label: 'Domingo', short: 'D' },
];

/** Índice del día actual (0 = Lunes, 6 = Domingo) */
function getTodayIndex(): number {
  const d = new Date().getDay(); // 0 = Domingo, 1 = Lunes, ...
  return d === 0 ? 6 : d - 1;
}

/** Convierte "09:00" o "9:00" a minutos desde medianoche */
function timeToMinutes(t: string): number {
  const [h, m] = t.trim().split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** True si la hora actual está entre open y close (strings "HH:MM") */
function isCurrentlyOpen(open?: string, close?: string): boolean {
  if (!open || !close) return false;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const openMin = timeToMinutes(open);
  let closeMin = timeToMinutes(close);
  if (closeMin < openMin) closeMin += 24 * 60; // cierra después de medianoche
  const currentDay = current >= 0 && current < 24 * 60 ? current : current + 24 * 60;
  return currentDay >= openMin && currentDay <= closeMin;
}

@Component({
  selector: 'app-public-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-menu.component.html',
  styleUrl: './public-menu.component.scss',
})
export class PublicMenuComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly publicMenuService = inject(PublicMenuService);

  menu = signal<PublicMenuResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.error.set('Slug no proporcionado');
        this.loading.set(false);
        return;
      }
      this.loadMenu(slug);
    });
  }

  private loadMenu(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.publicMenuService.getMenuBySlug(slug).subscribe({
      next: (menu) => {
        this.menu.set(menu);
        this.updateSignals();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el menú');
        this.loading.set(false);
      },
    });
  }

  restaurant = signal<PublicMenuResponse['restaurant'] | null>(null);
  categories = signal<PublicMenuResponse['categories']>([]);

  /** Índice del día actual para resaltar en la semana */
  readonly todayIndex = getTodayIndex();

  /**
   * Devuelve los horarios para la vista innovadora: día, texto, si es hoy y si está abierto ahora.
   */
  getScheduleEntries(
    schedule: PublicMenuResponse['restaurant']['schedule'] | undefined
  ): {
    key: string;
    label: string;
    short: string;
    text: string;
    isToday: boolean;
    isOpenNow: boolean | null;
  }[] {
    if (!schedule) return [];
    return SCHEDULE_DAYS.map(({ key, label, short }, index) => {
      const day = schedule[key];
      if (!day) return null;
      const text = day.closed
        ? 'Cerrado'
        : [day.open, day.close].filter(Boolean).join(' – ') || '—';
      const isToday = index === this.todayIndex;
      const isOpenNow =
        isToday && !day.closed && day.open && day.close
          ? isCurrentlyOpen(day.open, day.close)
          : null;
      return { key, label, short, text, isToday, isOpenNow };
    }).filter(
      (e): e is NonNullable<typeof e> => e !== null
    );
  }

  /** Para el badge de hoy: estado actual y texto del horario */
  getTodaySchedule(
    schedule: PublicMenuResponse['restaurant']['schedule'] | undefined
  ): { status: 'open' | 'closed'; text: string } | null {
    const entries = this.getScheduleEntries(schedule);
    const today = entries.find((e) => e.isToday);
    if (!today) return null;
    const status =
      today.isOpenNow === true ? 'open' : ('closed' as 'open' | 'closed');
    return { status, text: today.text };
  }

  private updateSignals(): void {
    const menuData = this.menu();
    if (menuData) {
      this.restaurant.set(menuData.restaurant);
      // Respetar el orden de categorías definido en el admin (reorder).
      // Ordenar por position para que el menú público refleje la organización.
      const sorted = [...menuData.categories].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      );
      this.categories.set(sorted);
    } else {
      this.restaurant.set(null);
      this.categories.set([]);
    }
  }
}

