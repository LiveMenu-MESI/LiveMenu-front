import { Component } from '@angular/core';
import { SidebarNavItemComponent } from '../sidebar-nav-item/sidebar-nav-item.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SidebarNavItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {}
