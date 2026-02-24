import { Component, input, output, signal } from '@angular/core';
import { QrDisplayComponent } from '../qr-display/qr-display.component';

@Component({
  selector: 'app-restaurant-menu-header',
  standalone: true,
  imports: [QrDisplayComponent],
  templateUrl: './restaurant-menu-header.component.html',
  styleUrl: './restaurant-menu-header.component.scss',
})
export class RestaurantMenuHeaderComponent {
  restaurantId = input.required<string>();
  name = input.required<string>();
  description = input<string>('');
  restaurantSlug = input<string | undefined>(undefined);
  /** Emitido al hacer clic en "Ver perfil" para abrir el modal de edición */
  editProfile = output<void>();
  
  showQr = signal(false);
  
  toggleQr(): void {
    this.showQr.update((v) => !v);
  }
}
