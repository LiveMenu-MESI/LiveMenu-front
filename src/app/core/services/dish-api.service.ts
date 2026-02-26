import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  getDishesUrl,
  getDishesBaseUrl,
  getDishesWithImageUrl,
  getDishByIdUrl,
  getDishWithImageUrl,
  getDishAvailabilityUrl,
} from '../constants/api.constants';
import type {
  DishResponseDto,
  DishCreateDto,
  DishUpdateDto,
} from '../models/dish-api.model';

@Injectable({ providedIn: 'root' })
export class DishApiService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Listado: GET .../restaurants/:restaurantId/dishes?categoryId=&available=
   */
  list(
    restaurantId: string,
    params?: { categoryId?: string; available?: boolean },
  ): Observable<DishResponseDto[]> {
    return this.http.get<DishResponseDto[]>(getDishesUrl(restaurantId, params));
  }

  /**
   * Obtener plato: GET .../restaurants/:restaurantId/dishes/:dishId
   */
  getById(restaurantId: string, dishId: string): Observable<DishResponseDto> {
    return this.http.get<DishResponseDto>(getDishByIdUrl(restaurantId, dishId));
  }

  /**
   * Crear plato: POST .../restaurants/:restaurantId/dishes
   */
  create(restaurantId: string, body: Omit<DishCreateDto, 'restaurantId'>): Observable<DishResponseDto> {
    return this.http.post<DishResponseDto>(getDishesBaseUrl(restaurantId), body);
  }

  /**
   * Crear plato con imagen: POST .../restaurants/:restaurantId/dishes/with-image
   */
  createWithImage(restaurantId: string, body: FormData): Observable<DishResponseDto> {
    return this.http.post<DishResponseDto>(getDishesWithImageUrl(restaurantId), body);
  }

  /**
   * Actualizar plato: PUT .../restaurants/:restaurantId/dishes/:dishId
   */
  update(
    restaurantId: string,
    dishId: string,
    body: DishUpdateDto,
  ): Observable<DishResponseDto> {
    return this.http.put<DishResponseDto>(getDishByIdUrl(restaurantId, dishId), body);
  }

  /**
   * Actualizar plato con imagen: PUT .../restaurants/:restaurantId/dishes/:dishId/with-image
   */
  updateWithImage(
    restaurantId: string,
    dishId: string,
    body: FormData,
  ): Observable<DishResponseDto> {
    return this.http.put<DishResponseDto>(getDishWithImageUrl(restaurantId, dishId), body);
  }

  /**
   * Eliminar plato: DELETE .../restaurants/:restaurantId/dishes/:dishId
   */
  delete(restaurantId: string, dishId: string): Observable<void> {
    return this.http.delete<void>(getDishByIdUrl(restaurantId, dishId));
  }

  /**
   * Editar estado de platillo: PATCH .../restaurants/:restaurantId/dishes/:dishId/availability
   */
  toggleAvailability(restaurantId: string, dishId: string): Observable<DishResponseDto> {
    return this.http.patch<DishResponseDto>(getDishAvailabilityUrl(restaurantId, dishId), {});
  }
}
