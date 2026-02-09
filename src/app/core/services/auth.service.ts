import { Injectable, signal } from '@angular/core';

/**
 * Servicio de autenticación. Almacena el token para las peticiones al API.
 * Para CU-02 (Restaurant Management) el backend espera: Authorization: Bearer {{access_token}}
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'livemenu_access_token';
  accessToken = signal<string | null>(this.loadToken());

  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
    this.accessToken.set(token);
  }

  getToken(): string | null {
    return this.accessToken();
  }

  private loadToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }
}
