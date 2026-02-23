import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicMenuService, type PublicMenuResponse } from '../../core/services/public-menu.service';

@Component({
  selector: 'app-public-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-menu.component.html',
  styleUrl: './public-menu.component.scss',
})
export class PublicMenuComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly publicMenuService = inject(PublicMenuService);

  menu = signal<PublicMenuResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.error.set('Slug no proporcionado');
        this.loading.set(false);
        return;
      }
      this.loadMenu(slug);
    });
  }

  private loadMenu(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.publicMenuService.getMenuBySlug(slug).subscribe({
      next: (menu) => {
        this.menu.set(menu);
        this.updateSignals();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el menú');
        this.loading.set(false);
      },
    });
  }

  restaurant = signal<PublicMenuResponse['restaurant'] | null>(null);
  categories = signal<PublicMenuResponse['categories']>([]);

  private updateSignals(): void {
    const menuData = this.menu();
    if (menuData) {
      this.restaurant.set(menuData.restaurant);
      this.categories.set(menuData.categories);
    } else {
      this.restaurant.set(null);
      this.categories.set([]);
    }
  }
}

