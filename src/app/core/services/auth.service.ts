import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constants';

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

/**
 * Servicio de autenticación. Almacena el token para las peticiones al API.
 * Para CU-02 (Restaurant Management) el backend espera: Authorization: Bearer {{access_token}}
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'livemenu_access_token';
  private readonly refreshTokenKey = 'livemenu_refresh_token';
  private isRefreshing = false;
  accessToken = signal<string | null>(this.loadToken());
  refreshToken = signal<string | null>(this.loadRefreshToken());

  constructor(private readonly http: HttpClient) {}

  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
    this.accessToken.set(token);
  }

  setRefreshToken(token: string | null): void {
    if (token) {
      localStorage.setItem(this.refreshTokenKey, token);
    } else {
      localStorage.removeItem(this.refreshTokenKey);
    }
    this.refreshToken.set(token);
  }

  getToken(): string | null {
    const stored = this.loadToken();
    if (stored !== this.accessToken()) this.accessToken.set(stored);
    return stored;
  }

  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  /**
   * Obtiene la información del usuario actual.
   * @returns Observable con la información del usuario
   */
  getCurrentUser(): Observable<{ id: string; email: string }> {
    const url = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.AUTH_USER}`;
    return this.http.get<{ id: string; email: string }>(url);
  }

  /**
   * Refresca el access token usando el refresh token.
   * Retorna un Observable que emite el nuevo access token.
   */
  refreshAccessToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.isRefreshing = true;
    const url = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.API_PREFIX}${API_CONSTANTS.ENDPOINTS.AUTH_REFRESH}`;
    
    return this.http.post<RefreshTokenResponse>(url, { refresh_token: refreshToken }).pipe(
      tap((response) => {
        this.setToken(response.access_token);
        if (response.refresh_token) {
          this.setRefreshToken(response.refresh_token);
        }
        this.isRefreshing = false;
      })
    );
  }

  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }

  setIsRefreshing(value: boolean): void {
    this.isRefreshing = value;
  }

  logout(): void {
    this.setToken(null);
    this.setRefreshToken(null);
    this.isRefreshing = false;
  }

  private loadToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private loadRefreshToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.refreshTokenKey);
  }
}
