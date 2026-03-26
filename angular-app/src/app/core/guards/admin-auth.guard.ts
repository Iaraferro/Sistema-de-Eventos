import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthDevService } from '../services/auth-dev.service';

export const adminAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthDevService);
  const router = inject(Router);

  if (authService.hasAdminSession()) {
    return true;
  }

  authService.logout(false);
  return router.createUrlTree(['/admin/acesso']);
};
