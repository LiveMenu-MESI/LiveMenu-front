import { Component, signal, computed, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarNavItemComponent } from '../sidebar-nav-item/sidebar-nav-item.component';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantApiService } from '../../../core/services/restaurant-api.service';

const MOBILE_BREAKPOINT = 768;

interface UserInfo {
  id: string;
  email: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SidebarNavItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly restaurantApi = inject(RestaurantApiService);
  private navSub: ReturnType<Router['events']['subscribe']> | null = null;

  menuOpen = signal(false);
  user = signal<UserInfo | null>(null);
  loadingUser = signal(true);
  /** ID del restaurante en la URL (cuando estás en /restaurants/:id o /restaurants/:id/menu) */
  currentRestaurantId = signal<string | null>(null);
  /** Lista de restaurantes del usuario (para mostrar Gestionar/Ver menú aunque no haya id en la URL) */
  restaurants = signal<{ id: string }[]>([]);

  /** ID a usar en los enlaces: el de la URL o el primero de la lista. Así Gestionar/Ver menú siempre están visibles. */
  displayRestaurantId = computed(() => {
    const fromUrl = this.currentRestaurantId();
    if (fromUrl) return fromUrl;
    const list = this.restaurants();
    return list.length > 0 ? list[0].id : null;
  });

  ngOnInit(): void {
    this.loadUser();
    this.loadRestaurants();
    this.updateRestaurantIdFromUrl(this.router.url);
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.updateRestaurantIdFromUrl(e.url));
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  private updateRestaurantIdFromUrl(url: string): void {
    const match = url.match(/\/restaurants\/([^/]+)/);
    this.currentRestaurantId.set(match ? match[1] : null);
  }

  private loadRestaurants(): void {
    this.restaurantApi.list().subscribe({
      next: (list) => this.restaurants.set(list),
      error: () => this.restaurants.set([]),
    });
  }

  private loadUser(): void {
    this.loadingUser.set(true);
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loadingUser.set(false);
      },
      error: () => {
        this.loadingUser.set(false);
      },
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > MOBILE_BREAKPOINT && this.menuOpen()) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  getUserInitials(): string {
    const user = this.user();
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  }

  /** Enlace a Analytics (solo path; los query params se pasan al cambiar restaurante en el header). */
  getAnalyticsLink(): string {
    return '/analytics';
  }
}
