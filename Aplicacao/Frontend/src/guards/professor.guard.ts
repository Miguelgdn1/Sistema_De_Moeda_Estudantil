import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const professorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  const user = auth.getCurrentUser();
  if (user?.tipoUsuario?.toUpperCase() === 'PROFESSOR') {
    return true;
  }

  snack.open('Área restrita a professores.', 'Fechar', { duration: 3000 });
  router.navigate(['/home']);
  return false;
};
