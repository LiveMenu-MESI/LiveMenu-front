import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { API_CONSTANTS } from '../constants/api.constants';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('token management', () => {
    it('should set and get token', () => {
      expect(service.getToken()).toBeNull();
      service.setToken('token-123');
      expect(service.getToken()).toBe('token-123');
      expect(service.accessToken()).toBe('token-123');
    });

    it('should clear token when set to null', () => {
      service.setToken('token-123');
      service.setToken(null);
      expect(service.getToken()).toBeNull();
      expect(service.accessToken()).toBeNull();
    });

    it('should set and get refresh token', () => {
      expect(service.getRefreshToken()).toBeNull();
      service.setRefreshToken('refresh-456');
      expect(service.getRefreshToken()).toBe('refresh-456');
    });

    it('should persist token in localStorage', () => {
      service.setToken('stored-token');
      expect(localStorage.getItem('livemenu_access_token')).toBe('stored-token');
      expect(service.getToken()).toBe('stored-token');
    });
  });

  describe('getCurrentUser', () => {
    it('should GET /api/v1/auth/user and return user', () => {
      const mockUser = { id: 'user-1', email: 'a@b.co' };
      service.getCurrentUser().subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/auth/user') && r.method === 'GET');
      expect(req.request.url).toContain(API_CONSTANTS.API_PREFIX);
      req.flush(mockUser);
    });
  });

  describe('refreshAccessToken', () => {
    it('should throw when no refresh token', () => {
      expect(() => service.refreshAccessToken()).toThrowError('No refresh token available');
    });

    it('should POST refresh token and update stored token', () => {
      service.setRefreshToken('old-refresh');
      const response = { access_token: 'new-access', refresh_token: 'new-refresh' };

      service.refreshAccessToken().subscribe((res) => {
        expect(res.access_token).toBe('new-access');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/auth/refresh') && r.method === 'POST');
      expect(req.request.body).toEqual({ refresh_token: 'old-refresh' });
      req.flush(response);

      expect(service.getToken()).toBe('new-access');
      expect(service.getRefreshToken()).toBe('new-refresh');
    });

    it('should call /auth/refresh with correct body', () => {
      service.setRefreshToken('my-refresh');
      service.refreshAccessToken().subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/auth/refresh'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refresh_token: 'my-refresh' });
      req.flush({ access_token: 'ok' });
    });
  });

  describe('logout', () => {
    it('should clear token and refresh token', () => {
      service.setToken('t');
      service.setRefreshToken('r');
      service.logout();
      expect(service.getToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
    });
  });
});
