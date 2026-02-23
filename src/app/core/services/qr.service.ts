import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getQrInfoUrl, getQrDownloadUrl } from '../constants/api.constants';

export interface QrInfoResponse {
  restaurantId: string;
  restaurantName: string;
  publicMenuUrl: string;
  qrUrl: string;
  availableSizes: ('S' | 'M' | 'L' | 'XL')[];
  availableFormats: ('PNG' | 'SVG')[];
}

export interface QrDownloadOptions {
  size?: 'S' | 'M' | 'L' | 'XL';
  format?: 'PNG' | 'SVG';
  includeLogo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class QrService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene información sobre el QR code del restaurante.
   * @param restaurantId UUID del restaurante
   * @returns Observable con información del QR y opciones disponibles
   */
  getQrInfo(restaurantId: string): Observable<QrInfoResponse> {
    return this.http.get<QrInfoResponse>(getQrInfoUrl(restaurantId));
  }

  /**
   * Descarga el QR code como imagen.
   * @param restaurantId UUID del restaurante
   * @param options Opciones de tamaño, formato y logo
   * @returns Observable con el blob de la imagen
   */
  downloadQr(restaurantId: string, options?: QrDownloadOptions): Observable<Blob> {
    return this.http.get(getQrDownloadUrl(restaurantId, options), {
      responseType: 'blob',
    });
  }

  /**
   * Obtiene la URL para descargar el QR code (útil para usar como src de img).
   * @param restaurantId UUID del restaurante
   * @param options Opciones de tamaño, formato y logo
   * @returns URL del QR code
   */
  getQrImageUrl(restaurantId: string, options?: QrDownloadOptions): string {
    return getQrDownloadUrl(restaurantId, options);
  }
}

