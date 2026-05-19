import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  const user = authService.getCurrentUser();
  
  if (user && user.tipoUsuario?.toUpperCase() === 'ADMIN') {
    return true; // Deixa passar
  }

  // Se for empresa, redireciona para o painel/edição da própria empresa
  if (user && user.tipoUsuario?.toUpperCase() === 'EMPRESA') {
    snack.open('Área reservada a administradores. Redirecionando para o painel da sua empresa.', 'Fechar', { duration: 3000 });
    router.navigate(['/empresas/editar']);
    return false;
  }

  // Bloqueia e redireciona para home por padrão
  snack.open('Área restrita a administradores do sistema.', 'Fechar', { duration: 4000 });
  router.navigate(['/home']);
  return false;
};