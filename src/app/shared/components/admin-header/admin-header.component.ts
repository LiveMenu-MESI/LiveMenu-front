import { Component, OnInit, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { RestaurantApiService } from '../../../core/services/restaurant-api.service';
import type { RestaurantResponseDto } from '../../../core/models/restaurant-api.model';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss',
})
export class AdminHeaderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly restaurantApi = inject(RestaurantApiService);
  private readonly el = inject(ElementRef<HTMLElement>);

  restaurants = signal<RestaurantResponseDto[]>([]);
  dropdownOpen = signal(false);
  loading = signal(true);

  /** ID del restaurante actual según la ruta (restaurants/:id) */
  currentRestaurantId = signal<string | null>(null);

  /** Restaurante seleccionado (el que coincide con la ruta) */
  currentRestaurant = computed(() => {
    const id = this.currentRestaurantId();
    const list = this.restaurants();
    if (!id) return null;
    return list.find((r) => r.id === id) ?? null;
  });

  /** URL actual para reaccionar a navegación y mostrar título "Menú Digital" en Ver menú */
  url = signal(this.router.url);

  /** True cuando la ruta es la vista "Ver menú" (restaurants/:id/menu) */
  isMenuPreviewRoute = computed(() => /\/restaurants\/[^/]+\/menu\/?$/.test(this.url()));

  /** True cuando estamos en Analytics: al cambiar restaurante se queda en /analytics */
  isAnalyticsRoute = computed(() => this.url().startsWith('/analytics'));

  ngOnInit(): void {
    this.loadRestaurants();
    this.updateCurrentIdFromUrl(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.url.set(e.url);
        this.updateCurrentIdFromUrl(e.url);
      });
  }

  private updateCurrentIdFromUrl(url: string): void {
    const restMatch = url.match(/\/restaurants\/([^/?#]+)/);
    if (restMatch) {
      this.currentRestaurantId.set(restMatch[1]);
      return;
    }
    // En /analytics?restaurantId=xxx usar ese id para el selector (sin redirigir a restaurants)
    if (url.startsWith('/analytics')) {
      const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
      const id = new URLSearchParams(query).get('restaurantId');
      this.currentRestaurantId.set(id);
      return;
    }
    this.currentRestaurantId.set(null);
  }

  private loadRestaurants(): void {
    this.loading.set(true);
    this.restaurantApi.list().subscribe({
      next: (list) => {
        this.restaurants.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((v) => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  selectRestaurant(restaurant: RestaurantResponseDto): void {
    if (this.isAnalyticsRoute()) {
      this.router.navigate(['/analytics'], { queryParams: { restaurantId: restaurant.id } });
    } else {
      this.router.navigate(['/restaurants', restaurant.id]);
    }
    this.closeDropdown();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dropdownOpen()) return;
    const target = event.target as Node;
    if (this.el.nativeElement.contains(target)) return;
    this.closeDropdown();
  }
}
