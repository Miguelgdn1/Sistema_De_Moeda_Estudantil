import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmpresaService } from '../../core/services/empresa.service';
import { EmpresaRequest } from '../../core/models/api-models';

@Component({
  standalone: true,
  selector: 'app-empresa-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <a mat-icon-button routerLink="/empresas"><mat-icon>arrow_back</mat-icon></a>
      <span>{{ isEdit() ? 'Editar Empresa' : 'Cadastrar Empresa Parceira' }}</span>
    </mat-toolbar>

    <div class="container">
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="grid">
              <mat-form-field appearance="outline">
                <mat-label>Nome Fantasia</mat-label>
                <input matInput formControlName="nomeFantasia" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>CNPJ (14 dígitos)</mat-label>
                <input matInput formControlName="cnpj" maxlength="14" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Senha {{ isEdit() ? '(deixe vazio para manter)' : '' }}</mat-label>
                <input matInput type="password" formControlName="senha" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Descrição</mat-label>
                <textarea matInput formControlName="descricao" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="actions">
              <a mat-button routerLink="/empresas">Cancelar</a>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .span-2 { grid-column: span 2; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
    }
  `],
})
export class EmpresaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private empresaService = inject(EmpresaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  saving = signal(false);
  empresaId = signal<number | null>(null);
  isEdit = () => this.empresaId() !== null;

  form = this.fb.nonNullable.group({
    nomeFantasia: ['', Validators.required],
    cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
    email: ['', [Validators.required, Validators.email]],
    senha: [''],
    descricao: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.empresaId.set(Number(id));
      this.empresaService.buscar(Number(id)).subscribe({
        next: (e) => {
          this.form.patchValue({
            nomeFantasia: e.nomeFantasia,
            cnpj: e.cnpj,
            email: e.email,
            descricao: e.descricao ?? '',
            senha: '',
          });
        },
        error: () => this.snack.open('Empresa não encontrada.', 'Fechar', { duration: 4000 }),
      });
    } else {
      this.form.controls.senha.addValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const dto = this.form.getRawValue() as EmpresaRequest;

    const obs = this.isEdit()
      ? this.empresaService.atualizar(this.empresaId()!, dto)
      : this.empresaService.cadastrar(dto);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(this.isEdit() ? 'Empresa atualizada.' : 'Empresa cadastrada.', 'Fechar', { duration: 3000 });
        this.router.navigate([this.isEdit() ? '/empresas' : '/login']);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.mensagem ?? 'Erro ao salvar empresa.';
        this.snack.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }
}
