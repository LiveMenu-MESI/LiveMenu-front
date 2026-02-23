import { Component, input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrService, type QrInfoResponse, type QrDownloadOptions } from '../../../core/services/qr.service';

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

  qrInfo = signal<QrInfoResponse | null>(null);
  qrImageUrl = signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedSize: QrDownloadOptions['size'] = 'M';
  selectedFormat: QrDownloadOptions['format'] = 'PNG';
  includeLogo = false;

  ngOnInit(): void {
    this.loadQrInfo();
  }

  private loadQrInfo(): void {
    this.loading.set(true);
    this.error.set(null);

    this.qrService.getQrInfo(this.restaurantId()).subscribe({
      next: (info) => {
        this.qrInfo.set(info);
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
    const url = this.qrService.getQrImageUrl(this.restaurantId(), {
      size: this.selectedSize,
      format: this.selectedFormat,
      includeLogo: this.includeLogo,
    });
    this.qrImageUrl.set(url);
  }

  onSizeChange(size: QrDownloadOptions['size']): void {
    this.selectedSize = size;
    this.updateQrImage();
  }

  onFormatChange(format: QrDownloadOptions['format']): void {
    this.selectedFormat = format;
    this.updateQrImage();
  }

  onLogoToggle(checked: boolean): void {
    this.includeLogo = checked;
    this.updateQrImage();
  }

  downloadQr(): void {
    this.qrService
      .downloadQr(this.restaurantId(), {
        size: this.selectedSize,
        format: this.selectedFormat,
        includeLogo: this.includeLogo,
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-${this.restaurantId()}-${this.selectedSize}.${this.selectedFormat.toLowerCase()}`;
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

