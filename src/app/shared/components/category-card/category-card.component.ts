import { Component, input, output, signal } from '@angular/core';
import type { CategoryResponseDto } from '../../../core/models/category-api.model';

const FOLDER_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

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

  edit = output<void>();
  delete = output<void>();

  expanded = signal(true);
  folderIcon = FOLDER_ICON;

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }
}
