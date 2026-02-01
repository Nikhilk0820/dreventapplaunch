import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);
  const hasSession =
    !!localStorage.getItem('authToken') ||
    !!localStorage.getItem('profileIdentifier');
  if (hasSession) {
    return true;
  }
  return router.parseUrl('/signin');
};
