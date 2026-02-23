import { Component, signal, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarNavItemComponent } from '../sidebar-nav-item/sidebar-nav-item.component';
import { AuthService } from '../../../core/services/auth.service';

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
export class SidebarComponent implements OnInit {
  private readonly authService = inject(AuthService);

  menuOpen = signal(false);
  user = signal<UserInfo | null>(null);
  loadingUser = signal(true);

  ngOnInit(): void {
    this.loadUser();
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
}
