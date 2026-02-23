import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService, type AnalyticsResponse } from '../../core/services/analytics.service';
import { RestaurantApiService } from '../../core/services/restaurant-api.service';
import { NotificationService } from '../../core/services/notification.service';
import type { RestaurantResponseDto } from '../../core/models/restaurant-api.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly restaurantApi = inject(RestaurantApiService);
  private readonly notificationService = inject(NotificationService);

  restaurantId = signal<string | null>(null);
  restaurant = signal<RestaurantResponseDto | null>(null);
  analytics = signal<AnalyticsResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  metrics = signal<AnalyticsResponse['metrics'] | null>(null);

  ngOnInit(): void {
    // Obtener restaurantId de query params o del primer restaurante disponible
    this.route.queryParams.subscribe((params) => {
      const id = params['restaurantId'];
      if (id) {
        this.restaurantId.set(id);
        this.loadRestaurant(id);
        this.loadAnalytics(id);
      } else {
        // Si no hay restaurantId, cargar el primer restaurante disponible
        this.restaurantApi.list().subscribe({
          next: (restaurants) => {
            if (restaurants.length > 0) {
              const firstRestaurant = restaurants[0];
              this.restaurantId.set(firstRestaurant.id);
              this.loadRestaurant(firstRestaurant.id);
              this.loadAnalytics(firstRestaurant.id);
            } else {
              this.error.set('No hay restaurantes disponibles');
              this.loading.set(false);
            }
          },
          error: (err) => {
            this.error.set(err?.message ?? 'Error al cargar restaurantes');
            this.loading.set(false);
          },
        });
      }
    });
  }

  private loadRestaurant(id: string): void {
    this.restaurantApi.getById(id).subscribe({
      next: (restaurant) => {
        this.restaurant.set(restaurant);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Error al cargar restaurante');
      },
    });
  }

  private loadAnalytics(restaurantId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.analyticsService.getAnalytics(restaurantId).subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.metrics.set(data.metrics);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar analytics');
        this.loading.set(false);
      },
    });
  }

  exportToCsv(): void {
    const restaurantId = this.restaurantId();
    if (!restaurantId) return;

    this.analyticsService.exportAnalytics(restaurantId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${restaurantId}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.notificationService.success('Analytics exportado correctamente');
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Error al exportar analytics');
      },
    });
  }

  getBarHeight(views: number, allDays: Array<{ date: string; views: number }>): number {
    if (!allDays || allDays.length === 0) return 0;
    const maxViews = Math.max(...allDays.map((d) => d.views));
    if (maxViews === 0) return 0;
    return (views / maxViews) * 100;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}

