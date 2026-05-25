import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmpresaService } from '../../services/empresa.service';
import { AuthService } from '../../services/auth.service';
import { EmpresaPayload } from '../../models/empresa.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { FormFieldComponent } from '../../shared/components/form-field.component';

@Component({
  standalone: true,
  selector: 'app-empresa-form-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    FormFieldComponent,
  ],
  templateUrl: './empresa-form-page.html',
  styleUrl: './empresa-form-page.css',
})
export class EmpresaFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  protected saving = signal(false);
  protected empresaId = signal<number | null>(null);

  protected isEdit = () => this.empresaId() !== null;
  protected invalid = (field: string) => {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  };
  protected backTarget = () => {
    const role = this.authService.getCurrentUser()?.tipoUsuario;
    return role === 'ADMIN' ? '/empresas' : '/home';
  };

  protected form = this.fb.nonNullable.group({
    nomeFantasia: ['', Validators.required],
    cnpj: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
    email: ['', [Validators.required, Validators.email]],
    senha: [''],
    descricao: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const routePath = this.route.snapshot.routeConfig?.path;

    if (id) {
      this.empresaId.set(Number(id));
    } else if (routePath === 'empresas/editar') {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.tipoUsuario === 'EMPRESA') {
        this.empresaId.set(currentUser.id);
      }
    }

    if (this.empresaId() !== null) {
      this.empresaService.buscar(this.empresaId()!).subscribe({
        next: (e) => this.form.patchValue({
          nomeFantasia: e.nomeFantasia,
          cnpj: e.cnpj,
          email: e.email,
          descricao: e.descricao ?? '',
          senha: '',
        }),
        error: () => this.snack.open('Empresa não encontrada.', 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] }),
      });
    } else {
      this.form.controls.senha.addValidators([Validators.required, Validators.minLength(6)]);
      this.form.controls.senha.updateValueAndValidity();
    }
  }

  cancel(): void {
    this.router.navigate([this.isEdit() ? this.backTarget() : '/login']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const dto = this.form.getRawValue() as EmpresaPayload;
    const id = this.empresaId();
    const obs = id !== null
      ? this.empresaService.atualizar(id, dto)
      : this.empresaService.cadastrar(dto);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        const msg = this.isEdit() ? 'Dados atualizados.' : 'Empresa cadastrada. Faça login para continuar.';
        this.snack.open(msg, 'Fechar', { duration: 3000, panelClass: ['snackbar-success'] });
        this.router.navigate([this.isEdit() ? this.backTarget() : '/login']);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? err?.error?.mensagem ?? 'Erro ao salvar empresa.';
        this.snack.open(msg, 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] });
      },
    });
  }
}
