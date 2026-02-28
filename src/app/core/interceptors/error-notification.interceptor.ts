import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { getHttpErrorMessage } from '../utils/http-error.utils';

/**
 * Interceptor que muestra una notificación global para cada error HTTP
 * y re-lanza el error para que los componentes puedan seguir manejándolo localmente.
 */
export const errorNotificationInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message = getHttpErrorMessage(err);
      notification.error(message);
      return throwError(() => err);
    })
  );
};
