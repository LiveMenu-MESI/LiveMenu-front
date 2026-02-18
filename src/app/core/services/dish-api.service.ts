import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getDishesUrl } from '../constants/api.constants';
import type { DishResponseDto } from '../models/dish-api.model';

@Injectable({ providedIn: 'root' })
export class DishApiService {
  constructor(private readonly http: HttpClient) {}

  list(restaurantId: string, categoryId: string): Observable<DishResponseDto[]> {
    return this.http.get<DishResponseDto[]>(getDishesUrl(restaurantId, categoryId));
  }
}
