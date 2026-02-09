import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  getRestaurantsUrl,
  getRestaurantByIdUrl,
} from '../constants/api.constants';
import type {
  RestaurantResponseDto,
  RestaurantCreateDto,
  RestaurantUpdateDto,
} from '../models/restaurant-api.model';

@Injectable({ providedIn: 'root' })
export class RestaurantApiService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<RestaurantResponseDto[]> {
    return this.http.get<RestaurantResponseDto[]>(getRestaurantsUrl());
  }

  getById(id: string): Observable<RestaurantResponseDto> {
    return this.http.get<RestaurantResponseDto>(getRestaurantByIdUrl(id));
  }

  create(body: RestaurantCreateDto): Observable<RestaurantResponseDto> {
    return this.http.post<RestaurantResponseDto>(getRestaurantsUrl(), body);
  }

  update(id: string, body: RestaurantUpdateDto): Observable<RestaurantResponseDto> {
    return this.http.put<RestaurantResponseDto>(getRestaurantByIdUrl(id), body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(getRestaurantByIdUrl(id));
  }
}
