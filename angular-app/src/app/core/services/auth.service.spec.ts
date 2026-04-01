import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUTH_TOKEN_STORAGE_KEY } from '../constants/storage.constants';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('recognizes an authenticated admin session from the JWT payload', () => {
    localStorage.setItem(
      AUTH_TOKEN_STORAGE_KEY,
      buildToken({
        exp: Math.floor(Date.now() / 1000) + 3600,
        groups: ['ADM'],
      }),
    );

    expect(service.isAuthenticated()).toBe(true);
    expect(service.hasAdminSession()).toBe(true);
  });

  it('clears expired tokens automatically', () => {
    localStorage.setItem(
      AUTH_TOKEN_STORAGE_KEY,
      buildToken({
        exp: Math.floor(Date.now() / 1000) - 60,
        groups: ['ADM'],
      }),
    );

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });
});

function buildToken(payload: Record<string, unknown>): string {
  const header = encodeBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}
