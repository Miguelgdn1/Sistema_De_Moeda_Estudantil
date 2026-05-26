import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/auth/login')) {
        auth.logout();
        snack.open('Sua sessão expirou. Faça login novamente.', 'Fechar', { panelClass: ['snackbar-warning'] });
        router.navigate(['/login']);
      } else if (err.status === 0) {
        snack.open('Não foi possível conectar ao servidor. Verifique sua conexão.', 'Fechar', { panelClass: ['snackbar-error'] });
      } else if (err.status >= 500) {
        snack.open('Erro interno do servidor. Tente novamente em instantes.', 'Fechar', { panelClass: ['snackbar-error'] });
      }
      return throwError(() => err);
    })
  );
};
