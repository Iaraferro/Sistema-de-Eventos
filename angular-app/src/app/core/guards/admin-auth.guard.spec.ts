import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { adminAuthGuard } from './admin-auth.guard';

describe('adminAuthGuard', () => {
  const authService = {
    hasAdminSession: vi.fn(),
    logout: vi.fn(),
  };

  let router: Router;

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    authService.hasAdminSession.mockReset();
    authService.logout.mockReset();

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    });

    router = TestBed.inject(Router);
  });

  it('allows access when the admin session is valid', () => {
    authService.hasAdminSession.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => adminAuthGuard(route, state));

    expect(result).toBe(true);
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('redirects guests to the access page and clears the session', () => {
    authService.hasAdminSession.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => adminAuthGuard(route, state)) as UrlTree;

    expect(authService.logout).toHaveBeenCalledWith(false);
    expect(router.serializeUrl(result)).toBe('/admin/acesso');
  });
});
