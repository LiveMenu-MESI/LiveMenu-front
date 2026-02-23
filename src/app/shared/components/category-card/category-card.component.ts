import { Component, input, output, signal } from '@angular/core';
import type { CategoryResponseDto } from '../../../core/models/category-api.model';
import type { DishResponseDto } from '../../../core/models/dish-api.model';

const FOLDER_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
const STAR_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
const PLATE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 6v6"/><path d="M6 12h12"/></svg>';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
})
export class CategoryCardComponent {
  category = input.required<CategoryResponseDto>();
  dishCount = input<number>(0);
  dishes = input<DishResponseDto[]>([]);

  edit = output<void>();
  delete = output<void>();
  editDish = output<DishResponseDto>();

  expanded = signal(true);
  folderIcon = FOLDER_ICON;
  starIcon = STAR_ICON;
  plateIcon = PLATE_ICON;

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  onDishClick(dish: DishResponseDto): void {
    this.editDish.emit(dish);
  }
}
