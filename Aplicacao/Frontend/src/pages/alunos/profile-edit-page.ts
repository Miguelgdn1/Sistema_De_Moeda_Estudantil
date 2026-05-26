import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { AlunoItem, AlunoProfileUpdatePayload } from '../../models/aluno.model';
import { EnderecoEstruturado } from '../../models/endereco.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { FormFieldComponent } from '../../shared/components/form-field.component';
import { CepInputComponent } from '../../shared/components/cep-input.component';

@Component({
  standalone: true,
  selector: 'app-profile-edit-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    FormFieldComponent,
    CepInputComponent,
  ],
  templateUrl: './profile-edit-page.html',
  styleUrl: './profile-edit-page.css',
})
export class ProfileEditPage implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  protected loading = signal(true);
  protected saving = signal(false);
  protected profile = signal<AlunoItem | null>(null);

  protected invalid = (field: string) => {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  };

  protected form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', Validators.pattern(/^\+[1-9]\d{1,14}$/)],
    cep: [''],
    logradouro: [''],
    numero: [''],
    complemento: [''],
    bairro: [''],
    cidade: [''],
    uf: [''],
    senha: ['', [Validators.minLength(6)]],
  });

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.profileService.getStudentProfile(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (p) => {
          this.profile.set(p);
          this.form.patchValue({
            nome: p.nome,
            email: p.email,
            telefone: p.telefone ?? '',
            cep: p.cep ?? '',
            logradouro: p.logradouro ?? '',
            numero: p.numero ?? '',
            complemento: p.complemento ?? '',
            bairro: p.bairro ?? '',
            cidade: p.cidade ?? '',
            uf: p.uf ?? '',
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.handleError(err, 'Erro ao carregar perfil.');
        },
      });
  }

  protected onCepEncontrado(endereco: EnderecoEstruturado): void {
    this.form.patchValue({
      cep: endereco.cep ?? this.form.controls.cep.value,
      logradouro: endereco.logradouro ?? '',
      bairro: endereco.bairro ?? '',
      cidade: endereco.cidade ?? '',
      uf: endereco.uf ?? '',
      complemento: endereco.complemento ?? this.form.controls.complemento.value,
    });
  }

  cancel(): void {
    this.router.navigate(['/alunos/painel']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload: AlunoProfileUpdatePayload = {
      nome: v.nome,
      email: v.email,
      telefone: v.telefone?.trim() || undefined,
      cep: v.cep || undefined,
      logradouro: v.logradouro || undefined,
      numero: v.numero || undefined,
      complemento: v.complemento || undefined,
      bairro: v.bairro || undefined,
      cidade: v.cidade || undefined,
      uf: v.uf || undefined,
      senha: v.senha?.trim() || undefined,
    };

    this.profileService.updateStudentProfile(user.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.authService.updateCurrentUserName(updated.nome);
          this.profile.set(updated);
          this.snack.open('Perfil atualizado.', 'Fechar', { duration: 3000, panelClass: ['snackbar-success'] });
          this.router.navigate(['/alunos/painel']);
        },
        error: (err) => {
          this.saving.set(false);
          this.handleError(err, 'Erro ao atualizar perfil.');
        },
      });
  }

  private handleError(err: any, fallback: string): void {
    if (err?.status === 401 || err?.status === 403) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    const msg = err?.error?.message || err?.error?.mensagem || fallback;
    this.snack.open(msg, 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] });
  }
}
