import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';

export const AuthGuard = async () => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  const user = JSON.parse(await storageService.getItem('user'));
  if (user) {
    return true;
  } else {
    router.navigate(['/login']);  // Redirigir a login si no está autenticado
    return false;
  }
};
