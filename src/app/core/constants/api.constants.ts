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

export function getDishesUrl(restaurantId: string, categoryId?: string): string {
  const base = `${BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.restaurantById(restaurantId)}/dishes`;
  return categoryId ? `${base}?categoryId=${categoryId}` : base;
}
