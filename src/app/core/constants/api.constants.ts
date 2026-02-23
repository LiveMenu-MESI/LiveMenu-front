import { config } from '../generated/config';

/**
 * Configuración de la API (Restaurant Management CU-02 y resto).
 * El host viene de .env (API_URL), inyectado vía config generado por scripts/load-env.js.
 */
const BASE_URL = config.apiUrl;

export const API_CONSTANTS = {
  BASE_URL,
  API_PREFIX: '/api/v1',
  ENDPOINTS: {
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_USER: '/auth/user',
    RESTAURANTS: '/admin/restaurants',
    restaurantById: (id: string) => `/admin/restaurants/${id}`,
  } as const,
} as const;

export function getRestaurantsUrl(): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.RESTAURANTS}`;
}

export function getRestaurantByIdUrl(id: string): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.restaurantById(id)}`;
}

export function getCategoriesUrl(restaurantId: string): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.restaurantById(restaurantId)}/categories`;
}

export function getCategoryByIdUrl(restaurantId: string, categoryId: string): string {
  return `${getCategoriesUrl(restaurantId)}/${categoryId}`;
}

/** Listado: GET .../restaurants/:restaurantId/dishes?categoryId=&available= */
export function getDishesUrl(
  restaurantId: string,
  params?: { categoryId?: string; available?: boolean },
): string {
  const base = `${BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.restaurantById(restaurantId)}/dishes`;
  if (!params) return base;
  const q = new URLSearchParams();
  if (params.categoryId != null) q.set('categoryId', params.categoryId);
  if (params.available != null) q.set('available', String(params.available));
  const query = q.toString();
  return query ? `${base}?${query}` : base;
}

/** Obtener plato: GET .../restaurants/:restaurantId/dishes/:dishId */
export function getDishByIdUrl(restaurantId: string, dishId: string): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.restaurantById(restaurantId)}/dishes/${dishId}`;
}

/** Crear plato: POST .../restaurants/:restaurantId/dishes */
export function getDishesBaseUrl(restaurantId: string): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.restaurantById(restaurantId)}/dishes`;
}

/** Crear plato con imagen: POST .../restaurants/:restaurantId/dishes/with-image */
export function getDishesWithImageUrl(restaurantId: string): string {
  return `${getDishesBaseUrl(restaurantId)}/with-image`;
}

/** Actualizar plato con imagen: PUT .../restaurants/:restaurantId/dishes/:dishId/with-image */
export function getDishWithImageUrl(restaurantId: string, dishId: string): string {
  return `${getDishByIdUrl(restaurantId, dishId)}/with-image`;
}

/** Editar estado disponibilidad: PATCH .../restaurants/:restaurantId/dishes/:dishId/availability */
export function getDishAvailabilityUrl(restaurantId: string, dishId: string): string {
  return `${getDishByIdUrl(restaurantId, dishId)}/availability`;
}
