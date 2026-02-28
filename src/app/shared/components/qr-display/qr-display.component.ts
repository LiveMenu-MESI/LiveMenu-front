import { Component, input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import QRCode from 'qrcode';
import { QrService, type QrInfoResponse, type QrDownloadOptions } from '../../../core/services/qr.service';
import { getHttpErrorMessage } from '../../../core/utils/http-error.utils';
import { config } from '../../../core/generated/config';

const QR_SIZE_PX: Record<string, number> = { S: 200, M: 400, L: 800, XL: 1200 };

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

  /** Sustituye 0.0.0.0 por localhost en una URL (p. ej. la que devuelve el backend). */
  private normalizeMenuUrl(url: string): string {
    return url.replace(/0\.0\.0\.0/g, 'localhost');
  }

  /** URL que se codifica en el QR: siempre sin 0.0.0.0 (usa URL del front). */
  getQrUrlToEncode(): string | null {
    const url = this.frontendMenuUrl();
    if (!url) return null;
    return this.normalizeMenuUrl(url);
  }

  /** URL a mostrar en la UI (nunca 0.0.0.0). */
  getDisplayMenuUrl(): string {
    const encoded = this.getQrUrlToEncode();
    const fromApi = this.qrInfo()?.publicMenuUrl ?? '';
    return (encoded ?? this.normalizeMenuUrl(fromApi)) || '—';
  }

  private loadQrInfo(): void {
    this.loading.set(true);
    this.error.set(null);

    this.qrService.getQrInfo(this.restaurantId()).subscribe({
      next: (info) => {
        this.qrInfo.set(info);
        // URL base del frontend: priorizar config (FRONTEND_URL del .env) para que el QR no use 0.0.0.0
        let baseUrl = config.frontendUrl || window.location.origin || 'http://localhost:4200';
        baseUrl = baseUrl.replace(/0\.0\.0\.0/g, 'localhost').replace(/\/+$/, '');
        // Slug: input o extraer de publicMenuUrl (ej. ".../m/restaurante" -> "restaurante")
        const slugFromInput = this.restaurantSlug();
        const slugFromApi = info.publicMenuUrl?.match(/\/m\/([^/?#]+)/)?.[1];
        const slug = slugFromInput ?? slugFromApi;
        if (slug) {
          this.frontendMenuUrl.set(`${baseUrl}/m/${slug}`);
        } else {
          this.frontendMenuUrl.set(info.publicMenuUrl ? this.normalizeMenuUrl(info.publicMenuUrl) : null);
        }
        this.updateQrImage();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(getHttpErrorMessage(err, 'Error al cargar información del QR'));
        this.loading.set(false);
      },
    });
  }

  updateQrImage(): void {
    const urlToEncode = this.getQrUrlToEncode();
    if (!urlToEncode) {
      this.imageError.set(true);
      return;
    }
    const sizeKey = this.selectedSize ?? 'M';
    const sizePx = QR_SIZE_PX[sizeKey] ?? 400;
    QRCode.toDataURL(urlToEncode, { width: sizePx, margin: 2 })
      .then((dataUrl) => {
        const oldUrl = this.qrImageUrl();
        if (oldUrl && oldUrl.startsWith('blob:')) {
          window.URL.revokeObjectURL(oldUrl);
        }
        this.qrImageUrl.set(dataUrl);
        this.imageError.set(false);
      })
      .catch((err) => {
        console.error('Error generating QR:', err);
        this.imageError.set(true);
        this.error.set('Error al generar el código QR');
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
    const urlToEncode = this.getQrUrlToEncode();
    if (!urlToEncode) {
      this.error.set('No hay URL del menú para generar el QR');
      return;
    }
    const sizeKey = this.selectedSize ?? 'M';
    const sizePx = QR_SIZE_PX[sizeKey] ?? 400;
    QRCode.toDataURL(urlToEncode, { width: sizePx, margin: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `qr-${this.restaurantId()}-${sizeKey}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.error('Error generating QR for download:', err);
        this.error.set('Error al descargar el QR');
      });
  }
}

