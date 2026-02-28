import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RestaurantApiService } from './restaurant-api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import type { RestaurantResponseDto, RestaurantCreateDto } from '../models/restaurant-api.model';

describe('RestaurantApiService', () => {
  let service: RestaurantApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.API_PREFIX}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RestaurantApiService],
    });
    service = TestBed.inject(RestaurantApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list() should GET /admin/restaurants', () => {
    const mock: RestaurantResponseDto[] = [
      { id: 'r1', name: 'Rest 1', slug: 'rest-1', description: '' },
    ];
    service.list().subscribe((data) => expect(data).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/admin/restaurants`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getById() should GET /admin/restaurants/:id', () => {
    const id = 'r-123';
    const mock: RestaurantResponseDto = { id, name: 'One', slug: 'one', description: '' };
    service.getById(id).subscribe((data) => expect(data).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/admin/restaurants/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('create() should POST /admin/restaurants', () => {
    const body: RestaurantCreateDto = { name: 'New', description: 'Desc' };
    const mock: RestaurantResponseDto = {
      id: 'new-id',
      name: body.name,
      slug: 'new',
      description: body.description ?? '',
    };
    service.create(body).subscribe((data) => expect(data.name).toBe(body.name));

    const req = httpMock.expectOne(`${baseUrl}/admin/restaurants`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('update() should PUT /admin/restaurants/:id', () => {
    const id = 'r-1';
    const body = { name: 'Updated', description: 'D' };
    const mock: RestaurantResponseDto = {
      id,
      name: body.name,
      slug: 'updated',
      description: body.description,
    };
    service.update(id, body).subscribe((data) => expect(data.name).toBe(body.name));

    const req = httpMock.expectOne(`${baseUrl}/admin/restaurants/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('delete() should DELETE /admin/restaurants/:id', () => {
    const id = 'r-1';
    service.delete(id).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/admin/restaurants/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
