import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicMenuService, type PublicMenuDish } from '../../core/services/public-menu.service';
import { getHttpErrorMessage } from '../../core/utils/http-error.utils';

@Component({
  selector: 'app-public-dish-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-dish-detail.component.html',
  styleUrl: './public-dish-detail.component.scss',
})
export class PublicDishDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly publicMenuService = inject(PublicMenuService);

  dish = signal<PublicMenuDish | null>(null);
  slug = signal<string>('');
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      const dishId = params.get('dishId');
      if (!slug || !dishId) {
        this.error.set('URL inválida');
        this.loading.set(false);
        return;
      }
      this.slug.set(slug);
      this.loadDish(slug, dishId);
    });
  }

  private loadDish(slug: string, dishId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.publicMenuService.getDishBySlug(slug, dishId).subscribe({
      next: (data) => {
        this.dish.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(getHttpErrorMessage(err, 'Error al cargar el plato'));
        this.loading.set(false);
      },
    });
  }
}
