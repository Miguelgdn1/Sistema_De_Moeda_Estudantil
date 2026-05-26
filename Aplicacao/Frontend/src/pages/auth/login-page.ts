import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, ProfessorPublicoItem } from '../../services/auth.service';
import { UserRole } from '../../models/user-role.model';
import { ButtonComponent } from '../../shared/components/button.component';
import { FormFieldComponent } from '../../shared/components/form-field.component';

const ROLE_ROUTES: Record<UserRole, string> = {
  ALUNO: '/alunos/painel',
  PROFESSOR: '/professor/painel',
  EMPRESA: '/empresas/vantagens',
  ADMIN: '/alunos',
};

type Mode = 'login' | 'signup' | 'professor';

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

  protected mode = signal<Mode>('login');
  protected showPassword = signal(false);
  protected loading = signal(false);
  protected professores = signal<ProfessorPublicoItem[]>([]);
  protected professoresCarregando = signal(false);

  protected form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  protected professorForm = this.fb.nonNullable.group({
    professorId: [0, [Validators.required, Validators.min(1)]],
    senha: ['', [Validators.required]],
  });

  abrirSeletorProfessor(): void {
    this.mode.set('professor');
    if (this.professores().length > 0) return;
    this.professoresCarregando.set(true);
    this.auth.listarProfessoresPublicos().subscribe({
      next: (lista) => { this.professores.set(lista); this.professoresCarregando.set(false); },
      error: () => {
        this.professoresCarregando.set(false);
        this.snack.open('Não foi possível carregar a lista de professores.', 'Fechar', { panelClass: ['snackbar-error'] });
      },
    });
  }

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
        this.snack.open(msg, 'Fechar', { panelClass: ['snackbar-error'] });
      },
    });
  }

  onSubmitProfessor(): void {
    if (this.professorForm.invalid) {
      this.professorForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { professorId, senha } = this.professorForm.getRawValue();
    this.auth.loginProfessor(professorId, senha).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([ROLE_ROUTES.PROFESSOR]);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? err?.error?.mensagem ?? 'Falha ao autenticar.';
        this.snack.open(msg, 'Fechar', { panelClass: ['snackbar-error'] });
      },
    });
  }
}
