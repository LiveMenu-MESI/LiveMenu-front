import { environment } from '../../../environments/environment';

/**
 * Configuración de la API (Restaurant Management CU-02 y resto).
 * El host viene de la variable de entorno API_URL (environment.apiUrl).
 */
const BASE_URL = environment.apiUrl;

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
