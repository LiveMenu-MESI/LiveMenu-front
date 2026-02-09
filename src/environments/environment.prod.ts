/**
 * Entorno de producción.
 * La URL del API se inyecta con la variable de entorno API_URL al construir (Docker/build).
 */
export const environment = {
  production: true,
  /** Base URL del backend (sin /api/v1). Variable de entorno: API_URL */
  apiUrl: 'http://localhost:8080',
};
