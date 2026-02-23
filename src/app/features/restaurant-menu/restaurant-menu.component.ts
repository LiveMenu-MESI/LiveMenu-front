import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { RestaurantMenuHeaderComponent } from '../../shared/components/restaurant-menu-header/restaurant-menu-header.component';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { CategoryFormModalComponent } from './category-form-modal/category-form-modal.component';
import { DishFormModalComponent } from './dish-form-modal/dish-form-modal.component';
import { RestaurantFormModalComponent } from '../restaurants/restaurant-form-modal/restaurant-form-modal.component';
import { RestaurantApiService } from '../../core/services/restaurant-api.service';
import { CategoryApiService } from '../../core/services/category-api.service';
import { DishApiService } from '../../core/services/dish-api.service';
import { NotificationService } from '../../core/services/notification.service';
import type { RestaurantResponseDto, RestaurantUpdateDto } from '../../core/models/restaurant-api.model';
import type { CategoryResponseDto } from '../../core/models/category-api.model';
import type { DishResponseDto } from '../../core/models/dish-api.model';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [
    DragDropModule,
    RestaurantMenuHeaderComponent,
    CategoryCardComponent,
    CategoryFormModalComponent,
    DishFormModalComponent,
    RestaurantFormModalComponent,
  ],
  templateUrl: './restaurant-menu.component.html',
  styleUrl: './restaurant-menu.component.scss',
})
export class RestaurantMenuComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  restaurantId = signal<string | null>(null);
  restaurant = signal<RestaurantResponseDto | null>(null);
  categories = signal<CategoryResponseDto[]>([]);
  /** Por categoría: categoryId -> número de platillos */
  dishCountByCategory = signal<Record<string, number>>({});
  /** Por categoría: categoryId -> lista de platillos */
  dishesByCategory = signal<Record<string, DishResponseDto[]>>({});
  loading = signal(true);
  error = signal<string | null>(null);

  /** Modal categoría: si es null = nueva categoría, si no = editar esa categoría */
  editingCategory = signal<CategoryResponseDto | null>(null);
  showCategoryModal = signal(false);

  /** Modal platillo: null = nuevo, si no = editar */
  editingDish = signal<DishResponseDto | null>(null);
  showDishModal = signal(false);

  /** Modal editar restaurante (desde "Ver perfil") */
  showRestaurantModal = signal(false);

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
    const byCategory: Record<string, DishResponseDto[]> = {};
    if (categories.length === 0) {
      this.dishCountByCategory.set({});
      this.dishesByCategory.set({});
      return;
    }
    let pending = categories.length;
    categories.forEach((cat) => {
      this.dishApi.list(restaurantId, { categoryId: cat.id }).subscribe({
        next: (dishes: DishResponseDto[]) => {
          counts[cat.id] = dishes.length;
          byCategory[cat.id] = dishes;
          pending--;
          if (pending === 0) {
            this.dishCountByCategory.set({ ...counts });
            this.dishesByCategory.set({ ...byCategory });
          }
        },
        error: () => {
          counts[cat.id] = 0;
          byCategory[cat.id] = [];
          pending--;
          if (pending === 0) {
            this.dishCountByCategory.set({ ...counts });
            this.dishesByCategory.set({ ...byCategory });
          }
        },
      });
    });
  }

  getDishes(categoryId: string): DishResponseDto[] {
    return this.dishesByCategory()[categoryId] ?? [];
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
      next: () => {
        this.loadCategories(restId);
        this.notificationService.success('Categoría eliminada correctamente');
      },
      error: (err: { message?: string }) => {
        const message = err?.message ?? 'Error al eliminar categoría';
        this.error.set(message);
        this.notificationService.error(message);
      },
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
          this.notificationService.success('Categoría actualizada correctamente');
        },
        error: (err: { message?: string }) => {
          const message = err?.message ?? 'Error al actualizar categoría';
          this.error.set(message);
          this.notificationService.error(message);
        },
      });
    } else {
      this.categoryApi.create(restId, { name: payload.name, description: payload.description }).subscribe({
        next: () => {
          this.loadCategories(restId);
          this.showCategoryModal.set(false);
          this.editingCategory.set(null);
          this.notificationService.success('Categoría creada correctamente');
        },
        error: (err: { message?: string }) => {
          const message = err?.message ?? 'Error al crear categoría';
          this.error.set(message);
          this.notificationService.error(message);
        },
      });
    }
  }

  onCategoryModalCancelled(): void {
    this.showCategoryModal.set(false);
    this.editingCategory.set(null);
  }

  addDish(): void {
    this.editingDish.set(null);
    this.showDishModal.set(true);
  }

  onEditDish(dish: DishResponseDto): void {
    this.editingDish.set(dish);
    this.showDishModal.set(true);
  }

  onDishModalSaved(payload: Record<string, unknown>): void {
    const restId = this.restaurantId();
    if (!restId) return;
    if (payload['id']) {
      this.dishApi.update(restId, payload['id'] as string, {
        categoryId: payload['categoryId'] as string,
        name: payload['name'] as string,
        price: payload['price'] as number,
        offerPrice: payload['offerPrice'] as number | undefined,
        description: payload['description'] as string | undefined,
        imageUrl: payload['imageUrl'] as string | undefined,
        tags: payload['tags'] as string[] | undefined,
        available: payload['available'] as boolean,
        featured: payload['featured'] as boolean,
      }).subscribe({
        next: () => {
          this.loadCategories(restId);
          this.showDishModal.set(false);
          this.editingDish.set(null);
          this.notificationService.success('Platillo actualizado correctamente');
        },
        error: (err: { message?: string }) => {
          const message = err?.message ?? 'Error al actualizar platillo';
          this.error.set(message);
          this.notificationService.error(message);
        },
      });
    } else {
      const body = {
        categoryId: payload['categoryId'] as string,
        name: payload['name'] as string,
        price: payload['price'] as number,
        offerPrice: payload['offerPrice'] as number | undefined,
        description: payload['description'] as string | undefined,
        imageUrl: payload['imageUrl'] as string | undefined,
        tags: payload['tags'] as string[] | undefined,
        available: (payload['available'] as boolean) ?? true,
        featured: (payload['featured'] as boolean) ?? false,
      };
      this.dishApi.create(restId, body).subscribe({
        next: () => {
          this.loadCategories(restId);
          this.showDishModal.set(false);
          this.editingDish.set(null);
          this.notificationService.success('Platillo creado correctamente');
        },
        error: (err: { message?: string }) => {
          const message = err?.message ?? 'Error al crear platillo';
          this.error.set(message);
          this.notificationService.error(message);
        },
      });
    }
  }

  onDishModalCancelled(): void {
    this.showDishModal.set(false);
    this.editingDish.set(null);
  }

  onEditProfile(): void {
    this.showRestaurantModal.set(true);
  }

  onRestaurantModalSaved(payload: RestaurantUpdateDto & { id?: string }): void {
    const id = payload.id;
    if (!id) {
      this.showRestaurantModal.set(false);
      return;
    }
    const { id: _id, ...body } = payload;
    this.restaurantApi.update(id, body).subscribe({
      next: (updated) => {
        this.restaurant.set(updated);
        this.showRestaurantModal.set(false);
        this.notificationService.success('Restaurante actualizado correctamente');
      },
      error: (err) => {
        const message = err?.message ?? 'Error al actualizar restaurante';
        this.error.set(message);
        this.notificationService.error(message);
      },
    });
  }

  onRestaurantModalCancelled(): void {
    this.showRestaurantModal.set(false);
  }

  getDishCount(categoryId: string): number {
    return this.dishCountByCategory()[categoryId] ?? 0;
  }

  onCategoryDrop(event: CdkDragDrop<CategoryResponseDto[]>): void {
    const restId = this.restaurantId();
    if (!restId) return;

    // Reordenar en el array local
    const categories = [...this.categories()];
    moveItemInArray(categories, event.previousIndex, event.currentIndex);
    this.categories.set(categories);

    // Enviar nuevo orden al backend
    const categoryIds = categories.map((cat) => cat.id);
    this.categoryApi.reorder(restId, categoryIds).subscribe({
      next: () => {
        this.notificationService.success('Categorías reordenadas correctamente');
      },
      error: (err: { message?: string }) => {
        // Si falla, recargar categorías para restaurar el orden original
        const message = err?.message ?? 'Error al reordenar categorías';
        this.error.set(message);
        this.notificationService.error(message);
        this.loadCategories(restId);
      },
    });
  }
}
