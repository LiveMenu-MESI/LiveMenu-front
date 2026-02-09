import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { RestaurantMenuHeaderComponent } from '../../shared/components/restaurant-menu-header/restaurant-menu-header.component';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { CategoryFormModalComponent } from './category-form-modal/category-form-modal.component';
import { RestaurantApiService } from '../../core/services/restaurant-api.service';
import { CategoryApiService } from '../../core/services/category-api.service';
import { DishApiService } from '../../core/services/dish-api.service';
import type { RestaurantResponseDto } from '../../core/models/restaurant-api.model';
import type { CategoryResponseDto } from '../../core/models/category-api.model';
import type { DishResponseDto } from '../../core/models/dish-api.model';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [RestaurantMenuHeaderComponent, CategoryCardComponent, CategoryFormModalComponent],
  templateUrl: './restaurant-menu.component.html',
  styleUrl: './restaurant-menu.component.scss',
})
export class RestaurantMenuComponent implements OnInit {
  restaurantId = signal<string | null>(null);
  restaurant = signal<RestaurantResponseDto | null>(null);
  categories = signal<CategoryResponseDto[]>([]);
  /** Por categoría: categoryId -> número de platillos */
  dishCountByCategory = signal<Record<string, number>>({});
  loading = signal(true);
  error = signal<string | null>(null);

  /** Modal categoría: si es null = nueva categoría, si no = editar esa categoría */
  editingCategory = signal<CategoryResponseDto | null>(null);
  showCategoryModal = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly restaurantApi: RestaurantApiService,
    private readonly categoryApi: CategoryApiService,
    private readonly dishApi: DishApiService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('restaurantId');
          this.restaurantId.set(id);
          this.loading.set(true);
          this.error.set(null);
          if (!id) {
            this.loading.set(false);
            return of(null);
          }
          return this.restaurantApi.getById(id);
        }),
      )
      .subscribe({
        next: (rest) => {
          if (rest) {
            this.restaurant.set(rest);
            this.loadCategories(rest.id);
          } else {
            this.loading.set(false);
          }
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Error al cargar el restaurante');
          this.loading.set(false);
        },
      });
  }

  private loadCategories(restaurantId: string): void {
    this.categoryApi.list(restaurantId).subscribe({
      next: (list: CategoryResponseDto[]) => {
        this.categories.set(list);
        this.loadDishCounts(restaurantId, list);
        this.loading.set(false);
      },
      error: (err: { message?: string }) => {
        this.error.set(err?.message ?? 'Error al cargar categorías');
        this.loading.set(false);
      },
    });
  }

  private loadDishCounts(restaurantId: string, categories: CategoryResponseDto[]): void {
    const counts: Record<string, number> = {};
    if (categories.length === 0) {
      this.dishCountByCategory.set({});
      return;
    }
    let pending = categories.length;
    categories.forEach((cat) => {
      this.dishApi.list(restaurantId, cat.id).subscribe({
        next: (dishes: DishResponseDto[]) => {
          counts[cat.id] = dishes.length;
          pending--;
          if (pending === 0) this.dishCountByCategory.set({ ...counts });
        },
        error: () => {
          counts[cat.id] = 0;
          pending--;
          if (pending === 0) this.dishCountByCategory.set({ ...counts });
        },
      });
    });
  }

  onEditCategory(category: CategoryResponseDto): void {
    this.editingCategory.set(category);
    this.showCategoryModal.set(true);
  }

  onDeleteCategory(category: CategoryResponseDto): void {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    const restId = this.restaurantId();
    if (!restId) return;
    this.categoryApi.delete(restId, category.id).subscribe({
      next: () => this.loadCategories(restId),
      error: (err: { message?: string }) => this.error.set(err?.message ?? 'Error al eliminar'),
    });
  }

  addCategory(): void {
    this.editingCategory.set(null);
    this.showCategoryModal.set(true);
  }

  onCategoryModalSaved(payload: { id?: string; name: string; description: string }): void {
    const restId = this.restaurantId();
    if (!restId) {
      this.showCategoryModal.set(false);
      this.editingCategory.set(null);
      return;
    }
    if (payload.id) {
      this.categoryApi.update(restId, payload.id, { name: payload.name, description: payload.description }).subscribe({
        next: () => {
          this.loadCategories(restId);
          this.showCategoryModal.set(false);
          this.editingCategory.set(null);
        },
        error: (err: { message?: string }) => this.error.set(err?.message ?? 'Error al actualizar categoría'),
      });
    } else {
      this.categoryApi.create(restId, { name: payload.name, description: payload.description }).subscribe({
        next: () => {
          this.loadCategories(restId);
          this.showCategoryModal.set(false);
          this.editingCategory.set(null);
        },
        error: (err: { message?: string }) => this.error.set(err?.message ?? 'Error al crear categoría'),
      });
    }
  }

  onCategoryModalCancelled(): void {
    this.showCategoryModal.set(false);
    this.editingCategory.set(null);
  }

  addDish(): void {
    // TODO: modal nuevo platillo
  }

  getDishCount(categoryId: string): number {
    return this.dishCountByCategory()[categoryId] ?? 0;
  }
}
