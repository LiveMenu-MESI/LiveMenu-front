import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryApiService } from './category-api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import type { CategoryResponseDto, CategoryCreateDto } from '../models/category-api.model';

describe('CategoryApiService', () => {
  let service: CategoryApiService;
  let httpMock: HttpTestingController;
  const restaurantId = 'rest-1';
  const baseRest = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.API_PREFIX}/admin/restaurants/${restaurantId}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryApiService],
    });
    service = TestBed.inject(CategoryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list() should GET .../restaurants/:id/categories', () => {
    const mock: CategoryResponseDto[] = [
      { id: 'c1', name: 'Entradas', position: 0, restaurantId },
    ];
    service.list(restaurantId).subscribe((data) => expect(data).toEqual(mock));

    const req = httpMock.expectOne(`${baseRest}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getById() should GET .../categories/:categoryId', () => {
    const categoryId = 'cat-1';
    const mock: CategoryResponseDto = { id: categoryId, name: 'Sopas', position: 1, restaurantId };
    service.getById(restaurantId, categoryId).subscribe((data) => expect(data).toEqual(mock));

    const req = httpMock.expectOne(`${baseRest}/categories/${categoryId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('create() should POST .../categories', () => {
    const body: CategoryCreateDto = { name: 'Postres', position: 2 };
    const mock: CategoryResponseDto = { id: 'c-new', name: body.name, position: body.position!, restaurantId };
    service.create(restaurantId, body).subscribe((data) => expect(data.name).toBe(body.name));

    const req = httpMock.expectOne(`${baseRest}/categories`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('update() should PUT .../categories/:categoryId', () => {
    const categoryId = 'c1';
    const body = { name: 'Entradas actualizadas' };
    const mock: CategoryResponseDto = { id: categoryId, name: body.name!, position: 0, restaurantId };
    service.update(restaurantId, categoryId, body).subscribe((data) => expect(data.name).toBe(body.name));

    const req = httpMock.expectOne(`${baseRest}/categories/${categoryId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('delete() should DELETE .../categories/:categoryId', () => {
    const categoryId = 'c1';
    service.delete(restaurantId, categoryId).subscribe();

    const req = httpMock.expectOne(`${baseRest}/categories/${categoryId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('reorder() should PATCH .../categories/reorder with categoryIds', () => {
    const categoryIds = ['c2', 'c1', 'c3'];
    service.reorder(restaurantId, categoryIds).subscribe();

    const req = httpMock.expectOne(`${baseRest}/categories/reorder`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ categoryIds });
    req.flush(null);
  });
});
