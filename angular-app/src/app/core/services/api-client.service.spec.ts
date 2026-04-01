import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUTH_TOKEN_STORAGE_KEY } from '../constants/storage.constants';
import { ApiClientService } from './api-client.service';

describe('ApiClientService', () => {
  let service: ApiClientService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });

    service = TestBed.inject(ApiClientService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('stores and clears the angular auth token using a single key', () => {
    expect(service.getToken()).toBeNull();

    service.setToken('token-angular');

    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('token-angular');
    expect(service.getToken()).toBe('token-angular');

    service.clearToken();

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('uses the shared /api base url', () => {
    expect(service.getBaseUrl()).toBe('/api');
  });
});
