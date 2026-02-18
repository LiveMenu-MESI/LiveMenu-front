import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  title = input.required<string>();
  subtitle = input<string>();
  /** Si es true, al hacer clic en el backdrop se cierra */
  closeOnBackdrop = input(true);

  closed = output<void>();

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.closed.emit();
    }
  }

  onCloseClick(): void {
    this.closed.emit();
  }
}
