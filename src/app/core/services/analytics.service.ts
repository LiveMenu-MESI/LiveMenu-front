import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getAnalyticsUrl, getAnalyticsExportUrl } from '../constants/api.constants';

export interface AnalyticsMetrics {
  totalViews: number;
  uniqueVisitors: number;
  viewsByDay: Array<{ date: string; views: number }>;
  popularDishes: Array<{ dishId: string; dishName: string; views: number }>;
  viewsByCategory: Array<{ categoryId: string; categoryName: string; views: number }>;
  averageViewsPerDay: number;
  peakDay?: { date: string; views: number };
}

export interface AnalyticsResponse {
  restaurantId: string;
  restaurantName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: AnalyticsMetrics;
}

export interface AnalyticsExportOptions {
  startDate?: string;
  endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene las métricas de analytics para un restaurante.
   * @param restaurantId UUID del restaurante
   * @param options Opciones de fecha (opcional)
   * @returns Observable con las métricas de analytics
   */
  getAnalytics(restaurantId: string, options?: AnalyticsExportOptions): Observable<AnalyticsResponse> {
    const url = getAnalyticsUrl(restaurantId);
    const params: Record<string, string> = {};
    if (options?.startDate) params['startDate'] = options.startDate;
    if (options?.endDate) params['endDate'] = options.endDate;
    
    return this.http.get<AnalyticsResponse>(url, { params });
  }

  /**
   * Exporta las métricas de analytics a CSV.
   * @param restaurantId UUID del restaurante
   * @param options Opciones de fecha (opcional)
   * @returns Observable con el blob del archivo CSV
   */
  exportAnalytics(restaurantId: string, options?: AnalyticsExportOptions): Observable<Blob> {
    return this.http.get(getAnalyticsExportUrl(restaurantId, options), {
      responseType: 'blob',
    });
  }
}

