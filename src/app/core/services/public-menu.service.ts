import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getPublicMenuUrl, getPublicDishUrl } from '../constants/api.constants';

export interface PublicMenuCategory {
  id: string;
  name: string;
  description?: string;
  position: number;
  dishes: PublicMenuDish[];
}

export interface PublicMenuDish {
  id: string;
  name: string;
  description?: string;
  price: number;
  offerPrice?: number | null;
  imageUrl?: string;
  tags?: string[];
  featured?: boolean;
  available?: boolean;
  position?: number;
}

export interface PublicMenuResponse {
  restaurant: {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    phone?: string;
    address?: string;
    schedule?: Record<string, { open?: string; close?: string; closed: boolean }>;
    slug: string;
  };
  categories: PublicMenuCategory[];
}

@Injectable({ providedIn: 'root' })
export class PublicMenuService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene el menú público de un restaurante por su slug.
   * Este endpoint es público y no requiere autenticación.
   * @param slug Slug del restaurante (URL-friendly identifier)
   * @returns Observable con el menú completo (solo categorías activas y platos disponibles)
   */
  getMenuBySlug(slug: string): Observable<PublicMenuResponse> {
    return this.http.get<PublicMenuResponse>(getPublicMenuUrl(slug));
  }

  /**
   * Obtiene un plato por slug y dishId (público).
   * El backend puede registrar una vista/métrica por platillo en esta llamada.
   */
  getDishBySlug(slug: string, dishId: string): Observable<PublicMenuDish> {
    return this.http.get<PublicMenuDish>(getPublicDishUrl(slug, dishId));
  }
}

