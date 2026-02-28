import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<Pick<AuthService, 'getToken'>>;
  let router: jasmine.SpyObj<Pick<Router, 'navigate'>>;

  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/restaurants' } as RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getToken']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should allow access when token exists', () => {
    authService.getToken.and.returnValue('valid-token');

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when no token', () => {
    authService.getToken.and.returnValue(null);

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/restaurants' } });
  });

  it('should redirect to login when token is empty string', () => {
    authService.getToken.and.returnValue('');

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/restaurants' } });
  });
});
