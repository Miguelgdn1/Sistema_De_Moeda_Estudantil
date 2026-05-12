import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>🪙 Sistema de Moeda Estudantil</mat-card-title>
          <mat-card-subtitle>Faça login para continuar</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              <mat-icon matSuffix>mail</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput type="password" formControlName="senha" autocomplete="current-password" />
              <mat-icon matSuffix>lock</mat-icon>
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || loading()"
              class="full-width"
            >
              {{ loading() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="actions">
          <a mat-button routerLink="/alunos/novo">Cadastrar Aluno</a>
          <a mat-button routerLink="/empresas/novo">Cadastrar Empresa</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #303841 0%, #3a4750 100%);
      padding: 16px;
    }
    .login-card { width: 100%; max-width: 420px; padding: 16px; }
    .full-width { width: 100%; }
    form { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
    .actions { display: flex; justify-content: space-between; }
    mat-card-title { font-size: 1.2rem; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = signal(false);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/alunos']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.mensagem ?? 'Falha ao autenticar.';
        this.snack.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }
}
