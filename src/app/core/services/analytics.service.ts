import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAnalyticsUrl, getAnalyticsExportUrl } from '../constants/api.constants';

/** Resumen de métricas del restaurante (nuevo formato API) */
export interface AnalyticsSummary {
  totalViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  uniqueVisitors: number;
  totalDishes: number;
  availableDishes: number;
  totalCategories: number;
}

/** Vistas por día (nuevo formato API) */
export interface DailyView {
  date: string;
  views: number;
  uniqueVisitors: number;
}

/** Plato popular con vistas (nuevo formato API) */
export interface PopularDish {
  dishId: string;
  dishName: string;
  views: number;
  available: boolean;
}

/** Respuesta actual del API de analytics */
export interface AnalyticsResponse {
  restaurantId: string;
  restaurantName: string;
  summary: AnalyticsSummary;
  dailyViews: DailyView[];
  popularDishes: PopularDish[];
  lastUpdated?: string;
}

/** Respuesta en snake_case que puede devolver el backend */
interface AnalyticsResponseRaw {
  restaurantId?: string;
  restaurant_id?: string;
  restaurantName?: string;
  restaurant_name?: string;
  summary?: Partial<AnalyticsSummary> | Record<string, unknown>;
  dailyViews?: DailyView[] | Array<Record<string, unknown>>;
  daily_views?: DailyView[] | Array<Record<string, unknown>>;
  popularDishes?: PopularDish[] | Array<Record<string, unknown>>;
  popular_dishes?: PopularDish[] | Array<Record<string, unknown>>;
  lastUpdated?: string;
  last_updated?: string;
  /** Formato antiguo (metrics) para compatibilidad */
  metrics?: Record<string, unknown>;
  period?: Record<string, unknown>;
}

export interface AnalyticsExportOptions {
  startDate?: string;
  endDate?: string;
}

function defaultSummary(): AnalyticsSummary {
  return {
    totalViews: 0,
    viewsLast7Days: 0,
    viewsLast30Days: 0,
    uniqueVisitors: 0,
    totalDishes: 0,
    availableDishes: 0,
    totalCategories: 0,
  };
}

function normalizeSummary(raw: Partial<AnalyticsSummary> | Record<string, unknown> | null | undefined): AnalyticsSummary {
  if (!raw) return defaultSummary();
  const r = raw as Record<string, unknown>;
  return {
    totalViews: Number(r['totalViews'] ?? r['total_views'] ?? 0),
    viewsLast7Days: Number(r['viewsLast7Days'] ?? r['views_last_7_days'] ?? 0),
    viewsLast30Days: Number(r['viewsLast30Days'] ?? r['views_last_30_days'] ?? 0),
    uniqueVisitors: Number(r['uniqueVisitors'] ?? r['unique_visitors'] ?? 0),
    totalDishes: Number(r['totalDishes'] ?? r['total_dishes'] ?? 0),
    availableDishes: Number(r['availableDishes'] ?? r['available_dishes'] ?? 0),
    totalCategories: Number(r['totalCategories'] ?? r['total_categories'] ?? 0),
  };
}

function normalizeDailyViews(raw: DailyView[] | Array<Record<string, unknown>> | null | undefined): DailyView[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((d) => {
    const row = d as Record<string, unknown>;
    return {
      date: String(row['date'] ?? ''),
      views: Number(row['views'] ?? 0),
      uniqueVisitors: Number(row['uniqueVisitors'] ?? row['unique_visitors'] ?? 0),
    };
  });
}

function normalizePopularDishes(
  raw: PopularDish[] | Array<Record<string, unknown>> | null | undefined
): PopularDish[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((d) => {
    const row = d as Record<string, unknown>;
    return {
      dishId: String(row['dishId'] ?? row['dish_id'] ?? ''),
      dishName: String(row['dishName'] ?? row['dish_name'] ?? ''),
      views: Number(row['views'] ?? 0),
      available: Boolean(row['available'] ?? true),
    };
  });
}

function normalizeResponse(
  restaurantId: string,
  data: AnalyticsResponseRaw | AnalyticsResponse | null | undefined
): AnalyticsResponse {
  if (!data) {
    return {
      restaurantId,
      restaurantName: '',
      summary: defaultSummary(),
      dailyViews: [],
      popularDishes: [],
    };
  }
  const d = data as Record<string, unknown>;

  // Nuevo formato: summary, dailyViews, popularDishes
  const summary = (d['summary'] ?? (d['metrics'] as Record<string, unknown>)) as Record<string, unknown> | undefined;
  const dailyViewsRaw = d['dailyViews'] ?? d['daily_views'] ?? (d['metrics'] as Record<string, unknown>)?.['viewsByDay'] ?? (d['metrics'] as Record<string, unknown>)?.['views_by_day'];
  const popularDishesRaw = d['popularDishes'] ?? d['popular_dishes'] ?? (d['metrics'] as Record<string, unknown>)?.['popularDishes'] ?? (d['metrics'] as Record<string, unknown>)?.['popular_dishes'];
  const lastUpdated = String(d['lastUpdated'] ?? d['last_updated'] ?? '');

  return {
    restaurantId: String(d['restaurantId'] ?? d['restaurant_id'] ?? restaurantId),
    restaurantName: String(d['restaurantName'] ?? d['restaurant_name'] ?? ''),
    summary: normalizeSummary(summary),
    dailyViews: normalizeDailyViews(dailyViewsRaw as DailyView[]),
    popularDishes: normalizePopularDishes(popularDishesRaw as PopularDish[]),
    lastUpdated: lastUpdated || undefined,
  };
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private readonly http: HttpClient) {}

  getAnalytics(restaurantId: string, options?: AnalyticsExportOptions): Observable<AnalyticsResponse> {
    const url = getAnalyticsUrl(restaurantId);
    const params: Record<string, string> = {};
    if (options?.startDate) params['startDate'] = options.startDate;
    if (options?.endDate) params['endDate'] = options.endDate;

    return this.http.get<AnalyticsResponseRaw | AnalyticsResponse>(url, { params }).pipe(
      map((data) => normalizeResponse(restaurantId, data))
    );
  }

  exportAnalytics(restaurantId: string, options?: AnalyticsExportOptions): Observable<Blob> {
    return this.http.get(getAnalyticsExportUrl(restaurantId, options), {
      responseType: 'blob',
    });
  }
}
