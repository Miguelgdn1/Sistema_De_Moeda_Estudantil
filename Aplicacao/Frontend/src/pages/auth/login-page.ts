import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user-role.model';
import { ButtonComponent } from '../../shared/components/button.component';
import { FormFieldComponent } from '../../shared/components/form-field.component';

const ROLE_ROUTES: Record<UserRole, string> = {
  ALUNO: '/alunos/painel',
  PROFESSOR: '/professor/painel',
  EMPRESA: '/empresas/vantagens',
  ADMIN: '/alunos',
};

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, FormFieldComponent],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  protected mode = signal<'login' | 'signup'>('login');
  protected showPassword = signal(false);
  protected loading = signal(false);

  protected form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.loading.set(false);
        const target = ROLE_ROUTES[res.tipoUsuario as UserRole] ?? '/home';
        this.router.navigate([target]);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? err?.error?.mensagem ?? 'Falha ao autenticar.';
        this.snack.open(msg, 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] });
      },
    });
  }
}
