import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthDevService } from '../services/auth-dev.service';

export const adminGuestGuard: CanActivateFn = () => {
  const authService = inject(AuthDevService);
  const router = inject(Router);

  if (authService.hasAdminSession()) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return true;
};
