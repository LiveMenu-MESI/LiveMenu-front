import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { AbstractControl } from '@angular/forms';
import { ImageUploadService } from '../../../core/services/image-upload.service';

const BUILDING_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><path d="M9 17h6"/></svg>';
const UPLOAD_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';

@Component({
  selector: 'app-logo-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-upload.component.html',
  styleUrl: './logo-upload.component.scss',
})
export class LogoUploadComponent {
  private readonly imageUploadService = inject(ImageUploadService);

  /** Control del formulario (logo URL). Si no se pasa, solo se muestra preview estático. */
  control = input<AbstractControl<string | null> | null>(null);

  buildingIcon = BUILDING_ICON;
  uploadIcon = UPLOAD_ICON;
  /** Si la imagen del logo falla al cargar, mostrar placeholder */
  logoImageError = signal(false);
  uploading = signal(false);
  uploadError = signal<string | null>(null);
  deleting = signal(false);

  get logoUrl(): string | null {
    const c = this.control();
    return c?.value ?? null;
  }

  /**
   * Extrae el filename de una URL de imagen.
   * Ejemplo: "https://storage.googleapis.com/bucket/image-uuid.webp" -> "image-uuid.webp"
   */
  private extractFilename(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      return parts[parts.length - 1] || null;
    } catch {
      // Si no es una URL válida, intentar extraer el último segmento
      const parts = url.split('/');
      return parts[parts.length - 1] || null;
    }
  }

  onLogoImageError(): void {
    this.logoImageError.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.uploadError.set('Formato no válido. Use JPEG, PNG o WebP.');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);
    this.logoImageError.set(false);

    this.imageUploadService.uploadImage(file).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        const ctrl = this.control();
        if (ctrl) {
          // Usar la URL thumbnail para logos (se muestran pequeños)
          ctrl.setValue(response.thumbnailUrl);
        }
        this.uploading.set(false);
      },
      error: (err) => {
        console.error('Upload error:', err);
        const errorMessage = err.error?.message || err.message || 'Error al subir la imagen';
        this.uploadError.set(errorMessage);
        this.uploading.set(false);
      },
    });
  }

  onDeleteImage(): void {
    const url = this.logoUrl;
    if (!url) return;

    const filename = this.extractFilename(url);
    if (!filename) {
      this.uploadError.set('No se pudo extraer el nombre del archivo');
      return;
    }

    if (!confirm('¿Eliminar esta imagen?')) return;

    this.deleting.set(true);
    this.uploadError.set(null);

    this.imageUploadService.deleteImage(filename).subscribe({
      next: () => {
        const ctrl = this.control();
        if (ctrl) {
          ctrl.setValue(null);
        }
        this.deleting.set(false);
      },
      error: (err) => {
        this.uploadError.set(err.error?.message || 'Error al eliminar la imagen');
        this.deleting.set(false);
      },
    });
  }
}
