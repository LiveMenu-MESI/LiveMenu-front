import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-restaurant-menu-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './restaurant-menu-header.component.html',
  styleUrl: './restaurant-menu-header.component.scss',
})
export class RestaurantMenuHeaderComponent {
  restaurantId = input.required<string>();
  name = input.required<string>();
  description = input<string>('');
}
