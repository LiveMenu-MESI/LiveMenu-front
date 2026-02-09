import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SIDEBAR_ICONS } from './sidebar-icons';

@Component({
  selector: 'app-sidebar-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-nav-item.component.html',
  styleUrl: './sidebar-nav-item.component.scss',
})
export class SidebarNavItemComponent {
  link = input<string>('');
  label = input.required<string>();
  /** Nombre del icono: home, dashboard, building, chart, calendar, message, bell, gear, logout */
  icon = input.required<string>();
  badge = input<number | null>(null);
  showArrow = input(false);
  showPlus = input(false);
  exact = input(false);

  get iconSvg(): string {
    return SIDEBAR_ICONS[this.icon()] ?? '';
  }
}
