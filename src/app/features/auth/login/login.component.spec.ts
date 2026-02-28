import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        AuthService,
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    spyOn(router, 'navigate').and.stub();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
    expect(component.form.get('email')?.hasError('required')).toBe(true);
    expect(component.form.get('password')?.hasError('required')).toBe(true);
  });

  it('onSubmit should not call API when form is invalid', () => {
    expect(component.form.valid).toBe(false);
    component.onSubmit();
    httpMock.expectNone((r) => r.url.includes('/auth/login'));
  });

  it('onSubmit should mark form as touched when invalid', () => {
    component.onSubmit();
    expect(component.form.get('email')?.touched).toBe(true);
    expect(component.form.get('password')?.touched).toBe(true);
  });

  it('onSubmit should POST login and on success set token and navigate', () => {
    component.form.setValue({ email: 'a@b.co', password: '123456' });
    component.onSubmit();

    const req = httpMock.expectOne((r) => r.url.includes('/auth/login') && r.method === 'POST');
    expect(req.request.body).toEqual({ email: 'a@b.co', password: '123456' });
    req.flush({ access_token: 'token-123', refresh_token: 'refresh-456' });

    expect(authService.getToken()).toBe('token-123');
    expect(router.navigate).toHaveBeenCalledWith(['/restaurants']);
  });

  it('onSubmit should use returnUrl from ActivatedRoute when provided', () => {
    // Crear componente con ActivatedRoute que tiene returnUrl (mismo TestBed ya tiene snapshot.queryParams)
    const routeWithReturn = TestBed.inject(ActivatedRoute);
    (routeWithReturn as { snapshot: { queryParams: Record<string, string> } }).snapshot.queryParams = { returnUrl: '/analytics' };
    component.form.setValue({ email: 'a@b.co', password: '123456' });
    component.onSubmit();

    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    req.flush({ access_token: 't' });
    expect(router.navigate).toHaveBeenCalledWith(['/analytics']);
  });

  it('onSubmit should set errorMessage on API error', () => {
    component.form.setValue({ email: 'a@b.co', password: '123456' });
    component.onSubmit();

    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.errorMessage).toBeTruthy();
    expect(component.isLoading).toBe(false);
  });
});
