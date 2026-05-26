import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfessorService } from '../../services/professor.service';
import { InstituicaoService } from '../../services/instituicao.service';
import { ProfessorPayload } from '../../models/professor.model';
import { InstituicaoItem } from '../../models/instituicao.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { FormFieldComponent } from '../../shared/components/form-field.component';

@Component({
  standalone: true,
  selector: 'app-professor-form-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    FormFieldComponent,
  ],
  templateUrl: './professor-form-page.html',
  styleUrl: './professor-form-page.css',
})
export class ProfessorFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private professorService = inject(ProfessorService);
  private instituicaoService = inject(InstituicaoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  protected instituicoes = signal<InstituicaoItem[]>([]);
  protected saving = signal(false);
  protected professorId = signal<number | null>(null);

  protected isEdit = () => this.professorId() !== null;
  protected invalid = (field: string) => {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  };

  protected form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: [''],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    departamento: ['', Validators.required],
    instituicaoId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.instituicaoService.listar().subscribe((list) => this.instituicoes.set(list));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.professorId.set(Number(id));
      this.form.controls.senha.clearValidators();
      this.form.controls.senha.updateValueAndValidity();
      this.professorService.getById(Number(id)).subscribe({
        next: (p) => this.form.patchValue({
          nome: p.nome,
          email: p.email,
          cpf: p.cpf,
          departamento: p.departamento,
          instituicaoId: p.instituicaoId,
          senha: '',
        }),
        error: () => this.snack.open('Professor não encontrado.', 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] }),
      });
    } else {
      this.form.controls.senha.addValidators([Validators.required, Validators.minLength(6)]);
      this.form.controls.senha.updateValueAndValidity();
    }
  }

  cancel(): void {
    this.router.navigate(['/professores']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const dto: ProfessorPayload = {
      nome: raw.nome,
      email: raw.email,
      senha: raw.senha || undefined,
      cpf: raw.cpf,
      departamento: raw.departamento,
      instituicaoId: raw.instituicaoId,
    };
    const obs = this.isEdit()
      ? this.professorService.atualizar(this.professorId()!, dto)
      : this.professorService.cadastrar(dto);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(this.isEdit() ? 'Professor atualizado.' : 'Professor cadastrado.', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.router.navigate(['/professores']);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = this.formatErrors(err?.error);
        this.snack.open(msg, 'Fechar', { duration: 4500, panelClass: ['snackbar-error'] });
      },
    });
  }

  private formatErrors(body: any): string {
    if (body?.message) return body.message;
    if (body?.mensagem) return body.mensagem;
    if (body?.camposInvalidos) {
      return Object.entries(body.camposInvalidos).map(([k, v]) => `${k}: ${v}`).join(' · ');
    }
    return 'Erro ao salvar professor.';
  }
}
