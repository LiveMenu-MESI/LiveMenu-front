import { Component, OnInit, signal, computed } from '@angular/core';
import { RestaurantApiService } from '../../core/services/restaurant-api.service';
import { CategoryApiService } from '../../core/services/category-api.service';
import { DishApiService } from '../../core/services/dish-api.service';
import type { RestaurantResponseDto } from '../../core/models/restaurant-api.model';
import type { CategoryResponseDto } from '../../core/models/category-api.model';
import type { DishResponseDto } from '../../core/models/dish-api.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  restaurants = signal<RestaurantResponseDto[]>([]);
  selectedRestaurantId = signal<string | null>(null);
  categories = signal<CategoryResponseDto[]>([]);
  dishes = signal<DishResponseDto[]>([]);
  selectedCategoryId = signal<string>('');
  loading = signal(true);
  error = signal<string | null>(null);
  restaurantDropdownOpen = signal(false);

  selectedRestaurant = computed(() => {
    const id = this.selectedRestaurantId();
    if (!id) return null;
    return this.restaurants().find((r) => r.id === id) ?? null;
  });

  filteredDishes = computed(() => {
    const catId = this.selectedCategoryId();
    const list = this.dishes();
    if (!catId) return list;
    return list.filter((d) => d.categoryId === catId);
  });

  constructor(
    private readonly restaurantApi: RestaurantApiService,
    private readonly categoryApi: CategoryApiService,
    private readonly dishApi: DishApiService,
  ) {}

  ngOnInit(): void {
    this.restaurantApi.list().subscribe({
      next: (list) => {
        this.restaurants.set(list);
        const first = list[0];
        if (first) {
          this.selectedRestaurantId.set(first.id);
          this.loadMenu(first.id);
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Error al cargar restaurantes');
        this.loading.set(false);
      },
    });
  }

  selectRestaurant(id: string): void {
    this.selectedRestaurantId.set(id);
    this.restaurantDropdownOpen.set(false);
    this.loadMenu(id);
  }

  toggleRestaurantDropdown(): void {
    this.restaurantDropdownOpen.update((v) => !v);
  }

  closeRestaurantDropdown(): void {
    this.restaurantDropdownOpen.set(false);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
  }

  private loadMenu(restaurantId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedCategoryId.set('');
    this.categoryApi.list(restaurantId).subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.dishApi.list(restaurantId, {}).subscribe({
          next: (dishes) => {
            this.dishes.set(dishes);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err?.message ?? 'Error al cargar platos');
            this.dishes.set([]);
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Error al cargar categorías');
        this.categories.set([]);
        this.dishes.set([]);
        this.loading.set(false);
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }
}
