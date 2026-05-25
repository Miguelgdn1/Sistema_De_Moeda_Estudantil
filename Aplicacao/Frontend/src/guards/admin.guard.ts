import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  const user = auth.getCurrentUser();
  const role = user?.tipoUsuario?.toUpperCase();

  if (role === 'ADMIN') return true;

  const message: Record<string, string> = {
    EMPRESA: 'Área restrita a administradores. Redirecionando para o painel da empresa.',
    PROFESSOR: 'Área restrita a administradores. Redirecionando para o painel do professor.',
    ALUNO: 'Área restrita a administradores.',
  };
  snack.open(message[role ?? ''] ?? 'Área restrita a administradores.', 'Fechar', { duration: 3000 });

  const target: Record<string, string> = {
    EMPRESA: '/empresas/editar',
    PROFESSOR: '/professor/painel',
    ALUNO: '/alunos/painel',
  };
  router.navigate([target[role ?? ''] ?? '/home']);
  return false;
};
