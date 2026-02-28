import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { switchMap, of } from 'rxjs';
import { forkJoin } from 'rxjs';
import { RestaurantApiService } from '../../core/services/restaurant-api.service';
import { CategoryApiService } from '../../core/services/category-api.service';
import { DishApiService } from '../../core/services/dish-api.service';
import { getHttpErrorMessage } from '../../core/utils/http-error.utils';
import type { RestaurantResponseDto } from '../../core/models/restaurant-api.model';
import type { CategoryResponseDto } from '../../core/models/category-api.model';
import type { DishResponseDto } from '../../core/models/dish-api.model';

const SCHEDULE_DAYS: { key: string; label: string }[] = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

function getTodayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

@Component({
  selector: 'app-restaurant-menu-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-menu-preview.component.html',
  styleUrl: './restaurant-menu-preview.component.scss',
})
export class RestaurantMenuPreviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly restaurantApi = inject(RestaurantApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly dishApi = inject(DishApiService);

  restaurant = signal<RestaurantResponseDto | null>(null);
  categories = signal<{ category: CategoryResponseDto; dishes: DishResponseDto[] }[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedCategoryId = signal<string | null>(null);
  readonly todayIndex = getTodayIndex();

  getFilteredDishes(): DishResponseDto[] {
    const cats = this.categories();
    const id = this.selectedCategoryId();
    if (!id) return cats.flatMap((c) => c.dishes);
    const cat = cats.find((c) => c.category.id === id);
    return cat?.dishes ?? [];
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  getScheduleEntries(
    schedule: RestaurantResponseDto['schedule'] | undefined
  ): { key: string; label: string; text: string; isToday: boolean }[] {
    if (!schedule) return [];
    return SCHEDULE_DAYS.map(({ key, label }, index) => {
      const day = schedule[key as keyof typeof schedule];
      if (!day) return null;
      const text = day.closed
        ? 'Cerrado'
        : [day.open, day.close].filter(Boolean).join(' – ') || '—';
      const isToday = index === this.todayIndex;
      return { key, label, text, isToday };
    }).filter((e): e is NonNullable<typeof e> => e !== null);
  }

  getTodaySchedule(
    schedule: RestaurantResponseDto['schedule'] | undefined
  ): { status: 'open' | 'closed'; text: string } | null {
    const entries = this.getScheduleEntries(schedule);
    const today = entries.find((e) => e.isToday);
    if (!today) return null;
    const day = schedule?.[today.key as keyof typeof schedule];
    const status =
      day && !day.closed && day.open && day.close ? 'open' : 'closed';
    return { status, text: today.text };
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('restaurantId');
          if (!id) {
            this.error.set('Restaurante no especificado');
            this.loading.set(false);
            return of(null);
          }
          return this.restaurantApi.getById(id).pipe(
            switchMap((rest) => {
              this.restaurant.set(rest);
              return this.categoryApi.list(id);
            }),
            switchMap((categoryList) => {
              const sorted = [...categoryList].sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0)
              );
              if (sorted.length === 0) {
                this.categories.set([]);
                this.loading.set(false);
                return of([]);
              }
              const requests = sorted.map((cat) =>
                this.dishApi.list(id, { categoryId: cat.id }).pipe(
                  switchMap((dishes) =>
                    of({ category: cat, dishes })
                  )
                )
              );
              return forkJoin(requests);
            })
          );
        })
      )
      .subscribe({
        next: (result) => {
          if (Array.isArray(result)) {
            this.categories.set(result);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(getHttpErrorMessage(err, 'Error al cargar el menú'));
          this.loading.set(false);
        },
      });
  }
}

