import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-restaurant-menu-header',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-menu-header.component.html',
  styleUrl: './restaurant-menu-header.component.scss',
})
export class RestaurantMenuHeaderComponent {
  restaurantId = input.required<string>();
  name = input.required<string>();
  description = input<string>('');
  /** Emitido al hacer clic en "Ver perfil" para abrir el modal de edición */
  editProfile = output<void>();
}
