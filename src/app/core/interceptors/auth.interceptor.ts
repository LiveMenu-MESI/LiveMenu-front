import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Token para evitar múltiples llamadas de refresh simultáneas
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  // Añadir token a la petición
  // No modificar headers si es FormData (para uploads de imágenes)
  if (token) {
    if (req.body instanceof FormData) {
      // Para FormData, solo añadir el token, el navegador maneja Content-Type automáticamente
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    } else {
      // Para otras peticiones, añadir token normalmente
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Si es un 401 y no estamos en proceso de refresh
      if (err.status === 401 && !auth.getIsRefreshing()) {
        const refreshToken = auth.getRefreshToken();
        
        // Si no hay refresh token, hacer logout
        if (!refreshToken) {
          auth.logout();
          router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          return throwError(() => err);
        }

        // Si ya hay un refresh en proceso, esperar a que termine
        if (refreshTokenSubject.value !== null) {
          return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((newToken) => {
              // Reintentar la petición original con el nuevo token
              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                })
              );
            })
          );
        }

        // Iniciar proceso de refresh
        auth.setIsRefreshing(true);
        refreshTokenSubject.next(null);

        return auth.refreshAccessToken().pipe(
          switchMap((response) => {
            auth.setIsRefreshing(false);
            refreshTokenSubject.next(response.access_token);
            
            // Reintentar la petición original con el nuevo token
            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${response.access_token}` },
              })
            );
          }),
          catchError((refreshError) => {
            // Si el refresh falla, hacer logout
            auth.setIsRefreshing(false);
            refreshTokenSubject.next(null);
            auth.logout();
            router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
            return throwError(() => refreshError);
          })
        );
      }

      // Para otros errores, simplemente propagar el error
      return throwError(() => err);
    })
  );
};
