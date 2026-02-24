import { Component, input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrService, type QrInfoResponse, type QrDownloadOptions } from '../../../core/services/qr.service';
import { config } from '../../../core/generated/config';

@Component({
  selector: 'app-qr-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-display.component.html',
  styleUrl: './qr-display.component.scss',
})
export class QrDisplayComponent implements OnInit {
  private readonly qrService = inject(QrService);

  /** ID del restaurante (requerido) */
  restaurantId = input.required<string>();
  /** Slug del restaurante (opcional, se usa para construir la URL del frontend) */
  restaurantSlug = input<string | undefined>(undefined);

  qrInfo = signal<QrInfoResponse | null>(null);
  qrImageUrl = signal<string | null>(null);
  frontendMenuUrl = signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedSize: QrDownloadOptions['size'] = 'M';
  selectedFormat: QrDownloadOptions['format'] = 'PNG';
  includeLogo = false;
  imageError = signal(false);

  ngOnInit(): void {
    this.loadQrInfo();
  }

  private loadQrInfo(): void {
    this.loading.set(true);
    this.error.set(null);

    this.qrService.getQrInfo(this.restaurantId()).subscribe({
      next: (info) => {
        this.qrInfo.set(info);
        // Construir URL del frontend usando el slug
        const slug = this.restaurantSlug();
        if (slug) {
          // Usar window.location.origin para obtener la URL real del frontend
          // Reemplazar 0.0.0.0 con localhost para que funcione correctamente
          let frontendUrl = window.location.origin;
          if (frontendUrl.includes('0.0.0.0')) {
            frontendUrl = frontendUrl.replace('0.0.0.0', 'localhost');
          }
          // Si no hay origin (por ejemplo, en pruebas), usar config.frontendUrl
          if (!frontendUrl || frontendUrl === 'null' || frontendUrl === 'undefined') {
            frontendUrl = config.frontendUrl || 'http://localhost:4200';
            if (frontendUrl.includes('0.0.0.0')) {
              frontendUrl = frontendUrl.replace('0.0.0.0', 'localhost');
            }
          }
          this.frontendMenuUrl.set(`${frontendUrl}/m/${slug}`);
        } else {
          // Si no hay slug, usar la URL del backend como fallback
          this.frontendMenuUrl.set(info.publicMenuUrl);
        }
        // Actualizar la imagen del QR después de establecer la URL del frontend
        this.updateQrImage();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar información del QR');
        this.loading.set(false);
      },
    });
  }

  updateQrImage(): void {
    const frontendUrl = this.frontendMenuUrl();
    // Cargar el QR como blob para evitar problemas de autenticación/CORS
    this.qrService
      .downloadQr(this.restaurantId(), {
        size: this.selectedSize,
        format: this.selectedFormat,
        includeLogo: this.includeLogo,
        url: frontendUrl || undefined,
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          // Revocar la URL anterior si existe
          const oldUrl = this.qrImageUrl();
          if (oldUrl && oldUrl.startsWith('blob:')) {
            window.URL.revokeObjectURL(oldUrl);
          }
          this.qrImageUrl.set(url);
          this.imageError.set(false);
        },
        error: (err) => {
          console.error('Error loading QR image:', err);
          this.imageError.set(true);
          this.error.set(err.error?.message || 'Error al cargar la imagen del QR');
        },
      });
  }

  onSizeChange(size: QrDownloadOptions['size']): void {
    this.selectedSize = size;
    this.imageError.set(false);
    this.updateQrImage();
  }

  onFormatChange(format: QrDownloadOptions['format']): void {
    this.selectedFormat = format;
    this.imageError.set(false);
    this.updateQrImage();
  }

  onLogoToggle(checked: boolean): void {
    this.includeLogo = checked;
    this.imageError.set(false);
    this.updateQrImage();
  }

  onImageError(event: Event): void {
    console.error('Error loading QR image:', event);
    this.imageError.set(true);
    this.error.set('Error al cargar la imagen del QR. Verifica la conexión o intenta descargar el QR.');
  }

  onImageLoad(): void {
    this.imageError.set(false);
  }

  downloadQr(): void {
    const frontendUrl = this.frontendMenuUrl();
    this.qrService
      .downloadQr(this.restaurantId(), {
        size: this.selectedSize,
        format: this.selectedFormat,
        includeLogo: this.includeLogo,
        url: frontendUrl || undefined,
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const size = this.selectedSize || 'M';
          const format = this.selectedFormat || 'PNG';
          link.download = `qr-${this.restaurantId()}-${size}.${format.toLowerCase()}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al descargar el QR');
        },
      });
  }
}

