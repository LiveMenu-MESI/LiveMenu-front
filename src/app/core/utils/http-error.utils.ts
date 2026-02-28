import { HttpErrorResponse } from '@angular/common/http';

/**
 * Mensajes por defecto según código HTTP (sin mensaje en el body).
 */
const DEFAULT_MESSAGES: Record<number, string> = {
  0: 'No hay conexión. Comprueba tu red e intenta de nuevo.',
  400: 'Solicitud incorrecta. Revisa los datos e intenta de nuevo.',
  401: 'Sesión expirada o no autorizado. Inicia sesión de nuevo.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'Recurso no encontrado.',
  408: 'La solicitud tardó demasiado. Intenta de nuevo.',
  409: 'Conflicto: el recurso ya existe o fue modificado.',
  422: 'Los datos enviados no son válidos. Revisa el formulario.',
  429: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.',
  500: 'Error del servidor. Intenta más tarde.',
  502: 'Servicio no disponible. Intenta más tarde.',
  503: 'Servicio en mantenimiento. Intenta más tarde.',
};

const DEFAULT_FALLBACK = 'Ha ocurrido un error. Intenta de nuevo.';

/**
 * Extrae un mensaje de error apto para el usuario desde HttpErrorResponse.
 * Prioridad: body.message → body.error → mensaje por código HTTP → fallback.
 */
export function getHttpErrorMessage(
  err: HttpErrorResponse | unknown,
  fallback: string = DEFAULT_FALLBACK
): string {
  if (!err) return fallback;

  const response = err instanceof HttpErrorResponse ? err : null;
  if (!response) {
    if (err instanceof Error) return err.message || fallback;
    return fallback;
  }

  const body = response.error;
  if (body && typeof body === 'object') {
    const msg = (body as { message?: string }).message ?? (body as { error?: string }).error;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
    const details = (body as { details?: string | string[] }).details;
    if (Array.isArray(details) && details.length > 0 && typeof details[0] === 'string') {
      return details[0];
    }
    if (typeof details === 'string' && details.trim()) return details;
  }

  const byStatus = DEFAULT_MESSAGES[response.status];
  if (byStatus) return byStatus;

  if (response.status >= 500) return DEFAULT_MESSAGES[500];
  if (response.status >= 400) return DEFAULT_MESSAGES[400] ?? fallback;

  return fallback;
}
