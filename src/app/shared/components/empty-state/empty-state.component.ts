import { Component, input, output } from '@angular/core';

const EMPTY_STATE_ICONS: Record<string, string> = {
  building:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><path d="M9 17h6"/></svg>',
};

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  title = input.required<string>();
  description = input<string>('');
  buttonLabel = input<string>('');
  icon = input<string>('building');
  /** Emitido al hacer clic en el botón principal */
  buttonClick = output<void>();

  get iconSvg(): string {
    return EMPTY_STATE_ICONS[this.icon()] ?? EMPTY_STATE_ICONS['building'];
  }
}
