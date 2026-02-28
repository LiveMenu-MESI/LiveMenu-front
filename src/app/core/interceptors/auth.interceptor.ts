import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, skip, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_CONSTANTS } from '../constants/api.constants';

// Emite el nuevo access_token cuando termina un refresh (o null si falló). Evita múltiples refreshes simultáneos.
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function isRefreshRequest(url: string): boolean {
  return url.includes(`${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.AUTH_REFRESH}`);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // No añadir Authorization a la petición de refresh (solo se envía refresh_token en el body)
  if (isRefreshRequest(req.url)) {
    return next(req).pipe(
      catchError((err: HttpErrorResponse) => {
        auth.setIsRefreshing(false);
        refreshTokenSubject.next(null);
        return throwError(() => err);
      })
    );
  }

  const token = auth.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        return throwError(() => err);
      }

      // Si ya hay un refresh en curso, esperar al resultado (skip(1) ignora el null inicial)
      if (auth.getIsRefreshing()) {
        return refreshTokenSubject.pipe(
          skip(1),
          take(1),
          switchMap((newToken) => {
            if (newToken) {
              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                })
              );
            }
            auth.logout();
            router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
            return throwError(() => err);
          })
        );
      }

      const refreshToken = auth.getRefreshToken();
      if (!refreshToken) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        return throwError(() => err);
      }

      auth.setIsRefreshing(true);
      refreshTokenSubject.next(null);

      return auth.refreshAccessToken().pipe(
        switchMap((response) => {
          auth.setIsRefreshing(false);
          refreshTokenSubject.next(response.access_token);
          return next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${response.access_token}` },
            })
          );
        }),
        catchError((refreshError) => {
          auth.setIsRefreshing(false);
          refreshTokenSubject.next(null);
          auth.logout();
          router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          return throwError(() => refreshError);
        })
      );
    })
  );
};
