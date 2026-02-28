import { Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RestaurantFormModalComponent } from './restaurant-form-modal/restaurant-form-modal.component';
import { RestaurantCardComponent } from '../../shared/components/restaurant-card/restaurant-card.component';
import type { Restaurant } from '../../shared/models/restaurant.model';
import type { RestaurantResponseDto } from '../../core/models/restaurant-api.model';
import { RestaurantApiService } from '../../core/services/restaurant-api.service';
import { getHttpErrorMessage } from '../../core/utils/http-error.utils';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    RestaurantFormModalComponent,
    RestaurantCardComponent,
  ],
  templateUrl: './restaurants.component.html',
  styleUrl: './restaurants.component.scss',
})
export class RestaurantsComponent implements OnInit {
  showCreateModal = signal(false);
  restaurants = signal<Restaurant[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  /** ID del restaurante en edición; si existe, el modal se abre en modo edición */
  editingRestaurant = signal<RestaurantResponseDto | null>(null);

  constructor(private readonly api: RestaurantApiService) {}

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({
      next: (list) => {
        this.restaurants.set(list.map((r) => this.toRestaurant(r)));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Error al cargar restaurantes');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingRestaurant.set(null);
    this.showCreateModal.set(true);
  }

  openEditModal(restaurant: Restaurant): void {
    this.api.getById(restaurant.id).subscribe({
      next: (dto) => {
        this.editingRestaurant.set(dto);
        this.showCreateModal.set(true);
      },
      error: (err) => this.error.set(getHttpErrorMessage(err, 'No se pudo cargar el restaurante')),
    });
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.editingRestaurant.set(null);
  }

  onRestaurantSaved(payload: { id?: string; name: string; description?: string; logo?: string; phone?: string; address?: string }): void {
    this.closeCreateModal();
    const { id, ...body } = payload;
    if (id) {
      this.api.update(id, body).subscribe({
        next: () => this.loadList(),
        error: (err) => this.error.set(getHttpErrorMessage(err, 'Error al actualizar')),
      });
    } else {
      this.api.create(body).subscribe({
        next: () => this.loadList(),
        error: (err) => this.error.set(getHttpErrorMessage(err, 'Error al crear')),
      });
    }
  }

  onDeleteRestaurant(restaurant: Restaurant): void {
    if (!confirm(`¿Eliminar "${restaurant.name}"?`)) return;
    this.api.delete(restaurant.id).subscribe({
      next: () => this.loadList(),
      error: (err) => this.error.set(getHttpErrorMessage(err, 'Error al eliminar')),
    });
  }

  private toRestaurant(dto: RestaurantResponseDto): Restaurant {
    const subtitle = dto.description?.trim()
      ? (dto.description.length > 50 ? dto.description.slice(0, 50) + '…' : dto.description)
      : '—';
    return { id: dto.id, name: dto.name, subtitle, logo: dto.logo };
  }
}
