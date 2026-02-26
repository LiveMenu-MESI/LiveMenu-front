import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getImageUploadUrl, getImageDeleteUrl } from '../constants/api.constants';

export interface ImageUploadResponse {
  originalUrl?: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  metadata?: {
    filename: string;
    size: number;
    format: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Sube una imagen y la procesa (redimensiona a múltiples tamaños).
   * @param file Archivo de imagen (JPEG, PNG, WebP, max 5MB)
   * @returns Observable con las URLs de las variantes de la imagen
   */
  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    const url = getImageUploadUrl();
    console.log('Uploading image to:', url);
    console.log('File:', file.name, file.type, file.size);

    return this.http.post<ImageUploadResponse>(url, formData, {
      // No establecer Content-Type manualmente, el navegador lo hace automáticamente para FormData
    });
  }

  /**
   * Elimina una imagen y todas sus variantes.
   * @param filename Nombre del archivo (UUID con extensión)
   */
  deleteImage(filename: string): Observable<void> {
    return this.http.delete<void>(getImageDeleteUrl(filename));
  }
}

