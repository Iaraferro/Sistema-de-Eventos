import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasAdminSession()) {
    return true;
  }

  authService.logout(false);
  return router.createUrlTree(['/admin/acesso']);
};
