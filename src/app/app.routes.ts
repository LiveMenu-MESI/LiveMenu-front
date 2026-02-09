import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'restaurants' },
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
        path: 'dashboard',
        loadComponent: () =>
          import('./features/restaurants/restaurants.component').then((m) => m.RestaurantsComponent),
      },
      {
        path: '**',
        redirectTo: 'restaurants',
      },
    ],
  },
];
