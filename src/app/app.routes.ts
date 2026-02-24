import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'logout',
    loadComponent: () =>
      import('./features/auth/logout/logout.component').then((m) => m.LogoutComponent),
  },
  {
    path: 'm/:slug',
    loadComponent: () =>
      import('./features/public-menu/public-menu.component').then((m) => m.PublicMenuComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'restaurants',
      },
      {
        path: 'restaurants',
        loadComponent: () =>
          import('./features/restaurants/restaurants.component').then((m) => m.RestaurantsComponent),
      },
      {
        path: 'restaurants/:restaurantId',
        loadComponent: () =>
          import('./features/restaurant-menu/restaurant-menu.component').then((m) => m.RestaurantMenuComponent),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent),
      },
      {
        path: '**',
        redirectTo: 'restaurants',
      },
    ],
  },
];
