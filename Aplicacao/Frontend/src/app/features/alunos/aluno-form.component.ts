import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlunoService } from '../../core/services/aluno.service';
import { InstituicaoService } from '../../core/services/instituicao.service';
import { Instituicao, AlunoRequest } from '../../core/models/api-models';

@Component({
  standalone: true,
  selector: 'app-aluno-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <a mat-icon-button routerLink="/alunos"><mat-icon>arrow_back</mat-icon></a>
      <span>{{ isEdit() ? 'Editar Aluno' : 'Cadastrar Aluno' }}</span>
    </mat-toolbar>

    <div class="container">
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="grid">
              <mat-form-field appearance="outline">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="nome" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Senha {{ isEdit() ? '(deixe vazio para manter)' : '' }}</mat-label>
                <input matInput type="password" formControlName="senha" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>CPF (11 dígitos)</mat-label>
                <input matInput formControlName="cpf" maxlength="11" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>RG</mat-label>
                <input matInput formControlName="rg" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Curso</mat-label>
                <input matInput formControlName="curso" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Endereço</mat-label>
                <textarea matInput formControlName="endereco" rows="2"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Instituição</mat-label>
                <mat-select formControlName="instituicaoId">
                  @for (i of instituicoes(); track i.id) {
                    <mat-option [value]="i.id">{{ i.nome }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="actions">
              <a mat-button routerLink="/alunos">Cancelar</a>
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
export class AlunoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private alunoService = inject(AlunoService);
  private instituicaoService = inject(InstituicaoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  instituicoes = signal<Instituicao[]>([]);
  saving = signal(false);
  alunoId = signal<number | null>(null);
  isEdit = () => this.alunoId() !== null;

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.minLength(6)]],
    cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    rg: ['', Validators.required],
    curso: ['', Validators.required],
    endereco: [''],
    instituicaoId: [0, Validators.required],
  });

  ngOnInit(): void {
    this.instituicaoService.listar().subscribe((list) => this.instituicoes.set(list));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.alunoId.set(Number(id));
      this.form.controls.senha.clearValidators();
      this.form.controls.senha.updateValueAndValidity();
      this.alunoService.buscar(Number(id)).subscribe({
        next: (a) => {
          this.form.patchValue({
            nome: a.nome,
            email: a.email,
            cpf: a.cpf,
            rg: a.rg,
            curso: a.curso,
            endereco: a.endereco ?? '',
            instituicaoId: a.instituicaoId,
            senha: '',
          });
        },
        error: () => this.snack.open('Aluno não encontrado.', 'Fechar', { duration: 4000 }),
      });
    } else {
      this.form.controls.senha.addValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const dto = this.form.getRawValue() as AlunoRequest;

    const obs = this.isEdit()
      ? this.alunoService.atualizar(this.alunoId()!, dto)
      : this.alunoService.cadastrar(dto);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(this.isEdit() ? 'Aluno atualizado.' : 'Aluno cadastrado.', 'Fechar', { duration: 3000 });
        this.router.navigate([this.isEdit() ? '/alunos' : '/login']);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.mensagem ?? 'Erro ao salvar aluno.';
        this.snack.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }
}
