import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DishApiService } from './dish-api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import type { DishResponseDto } from '../models/dish-api.model';

describe('DishApiService', () => {
  let service: DishApiService;
  let httpMock: HttpTestingController;
  const restaurantId = 'rest-1';
  const baseRest = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.API_PREFIX}/admin/restaurants/${restaurantId}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DishApiService],
    });
    service = TestBed.inject(DishApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list() should GET .../dishes', () => {
    const mock: DishResponseDto[] = [
      { id: 'd1', categoryId: 'c1', name: 'Ensalada', price: 5 },
    ];
    service.list(restaurantId).subscribe((data) => expect(data).toEqual(mock));

    const req = httpMock.expectOne(`${baseRest}/dishes`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('list() with params should add query params', () => {
    service.list(restaurantId, { categoryId: 'c1', available: true }).subscribe();

    const req = httpMock.expectOne((r) => r.url.startsWith(`${baseRest}/dishes`) && r.url.includes('categoryId=c1') && r.url.includes('available=true'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getById() should GET .../dishes/:dishId', () => {
    const dishId = 'd1';
    const mock: DishResponseDto = { id: dishId, categoryId: 'c1', name: 'Sopa', price: 4 };
    service.getById(restaurantId, dishId).subscribe((data) => expect(data).toEqual(mock));

    const req = httpMock.expectOne(`${baseRest}/dishes/${dishId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('create() should POST .../dishes', () => {
    const body = { categoryId: 'c1', name: 'Postre', price: 3 };
    const mock: DishResponseDto = { id: 'd-new', categoryId: body.categoryId, name: body.name, price: body.price };
    service.create(restaurantId, body).subscribe((data) => expect(data.name).toBe(body.name));

    const req = httpMock.expectOne(`${baseRest}/dishes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('createWithImage() should POST .../dishes/with-image', () => {
    const formData = new FormData();
    formData.append('name', 'Pizza');
    const mock: DishResponseDto = { id: 'd1', categoryId: 'c1', name: 'Pizza', price: 10 };
    service.createWithImage(restaurantId, formData).subscribe((data) => expect(data.name).toBe('Pizza'));

    const req = httpMock.expectOne(`${baseRest}/dishes/with-image`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    req.flush(mock);
  });

  it('update() should PUT .../dishes/:dishId', () => {
    const dishId = 'd1';
    const body = { name: 'Ensalada grande', price: 6 };
    const mock: DishResponseDto = { id: dishId, categoryId: 'c1', name: body.name!, price: body.price! };
    service.update(restaurantId, dishId, body).subscribe((data) => expect(data.name).toBe(body.name));

    const req = httpMock.expectOne(`${baseRest}/dishes/${dishId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('updateWithImage() should PUT .../dishes/:dishId/with-image', () => {
    const dishId = 'd1';
    const formData = new FormData();
    service.updateWithImage(restaurantId, dishId, formData).subscribe();

    const req = httpMock.expectOne(`${baseRest}/dishes/${dishId}/with-image`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: dishId, name: 'X', price: 1, categoryId: 'c1' });
  });

  it('delete() should DELETE .../dishes/:dishId', () => {
    const dishId = 'd1';
    service.delete(restaurantId, dishId).subscribe();

    const req = httpMock.expectOne(`${baseRest}/dishes/${dishId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('toggleAvailability() should PATCH .../dishes/:dishId/availability', () => {
    const dishId = 'd1';
    const mock: DishResponseDto = { id: dishId, categoryId: 'c1', name: 'X', price: 1, available: true };
    service.toggleAvailability(restaurantId, dishId).subscribe((data) => expect(data.available).toBe(true));

    const req = httpMock.expectOne(`${baseRest}/dishes/${dishId}/availability`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mock);
  });
});
