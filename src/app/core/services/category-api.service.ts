import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getCategoriesUrl, getCategoryByIdUrl } from '../constants/api.constants';
import type { CategoryResponseDto, CategoryCreateDto, CategoryUpdateDto } from '../models/category-api.model';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  constructor(private readonly http: HttpClient) {}

  list(restaurantId: string): Observable<CategoryResponseDto[]> {
    return this.http.get<CategoryResponseDto[]>(getCategoriesUrl(restaurantId));
  }

  getById(restaurantId: string, categoryId: string): Observable<CategoryResponseDto> {
    return this.http.get<CategoryResponseDto>(getCategoryByIdUrl(restaurantId, categoryId));
  }

  create(restaurantId: string, body: CategoryCreateDto): Observable<CategoryResponseDto> {
    return this.http.post<CategoryResponseDto>(getCategoriesUrl(restaurantId), body);
  }

  update(restaurantId: string, categoryId: string, body: CategoryUpdateDto): Observable<CategoryResponseDto> {
    return this.http.put<CategoryResponseDto>(getCategoryByIdUrl(restaurantId, categoryId), body);
  }

  delete(restaurantId: string, categoryId: string): Observable<void> {
    return this.http.delete<void>(getCategoryByIdUrl(restaurantId, categoryId));
  }
}
