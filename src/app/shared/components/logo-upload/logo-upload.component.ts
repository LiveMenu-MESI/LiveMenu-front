import { Component, input, signal } from '@angular/core';
import type { AbstractControl } from '@angular/forms';

const BUILDING_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><path d="M9 17h6"/></svg>';
const UPLOAD_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';

@Component({
  selector: 'app-logo-upload',
  standalone: true,
  imports: [],
  templateUrl: './logo-upload.component.html',
  styleUrl: './logo-upload.component.scss',
})
export class LogoUploadComponent {
  /** Control del formulario (logo URL). Si no se pasa, solo se muestra preview estático. */
  control = input<AbstractControl<string | null> | null>(null);

  buildingIcon = BUILDING_ICON;
  uploadIcon = UPLOAD_ICON;
  /** Si la imagen del logo falla al cargar, mostrar placeholder */
  logoImageError = signal(false);

  get logoUrl(): string | null {
    const c = this.control();
    return c?.value ?? null;
  }

  onLogoImageError(): void {
    this.logoImageError.set(true);
  }
}
