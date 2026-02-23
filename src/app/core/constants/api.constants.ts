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

/** Reordenar categorías: PATCH .../restaurants/:restaurantId/categories/reorder */
export function getCategoriesReorderUrl(restaurantId: string): string {
  return `${getCategoriesUrl(restaurantId)}/reorder`;
}

/** Upload de imagen: POST /api/v1/images/upload */
export function getImageUploadUrl(): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}/images/upload`;
}

/** Eliminar imagen: DELETE /api/v1/images/:filename */
export function getImageDeleteUrl(filename: string): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}/images/${filename}`;
}

/** Menú público: GET /api/v1/public/menu/:slug */
export function getPublicMenuUrl(slug: string): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}/public/menu/${slug}`;
}

/** Info de QR: GET /api/v1/admin/restaurants/:restaurantId/qr */
export function getQrInfoUrl(restaurantId: string): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.restaurantById(restaurantId)}/qr`;
}

/** Descargar QR: GET /api/v1/admin/restaurants/:restaurantId/qr/download */
export function getQrDownloadUrl(
  restaurantId: string,
  options?: { size?: 'S' | 'M' | 'L' | 'XL'; format?: 'PNG' | 'SVG'; includeLogo?: boolean }
): string {
  const base = `${getQrInfoUrl(restaurantId)}/download`;
  if (!options) return base;
  
  const params = new URLSearchParams();
  if (options.size) params.set('size', options.size);
  if (options.format) params.set('format', options.format);
  if (options.includeLogo !== undefined) params.set('includeLogo', String(options.includeLogo));
  
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/** Usuario actual: GET /api/v1/auth/user */
export function getCurrentUserUrl(): string {
  return `${BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.AUTH_USER}`;
}