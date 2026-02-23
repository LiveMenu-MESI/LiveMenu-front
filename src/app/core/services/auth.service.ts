import { Injectable, signal } from '@angular/core';

/**
 * Servicio de autenticación. Almacena el token para las peticiones al API.
 * Para CU-02 (Restaurant Management) el backend espera: Authorization: Bearer {{access_token}}
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'livemenu_access_token';
  private readonly refreshTokenKey = 'livemenu_refresh_token';
  accessToken = signal<string | null>(this.loadToken());
  refreshToken = signal<string | null>(this.loadRefreshToken());

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

  logout(): void {
    this.setToken(null);
    this.setRefreshToken(null);
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
