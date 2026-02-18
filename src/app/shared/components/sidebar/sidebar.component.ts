import { Component, signal, HostListener } from '@angular/core';
import { SidebarNavItemComponent } from '../sidebar-nav-item/sidebar-nav-item.component';

const MOBILE_BREAKPOINT = 768;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SidebarNavItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  menuOpen = signal(false);

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
}
