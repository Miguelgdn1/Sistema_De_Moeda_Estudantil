import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlunoService } from '../../services/aluno.service';
import { InstituicaoService } from '../../services/instituicao.service';
import { AlunoPayload } from '../../models/aluno.model';
import { InstituicaoItem } from '../../models/instituicao.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { FormFieldComponent } from '../../shared/components/form-field.component';

const CURSOS = [
  'Administração', 'Análise e Desenvolvimento de Sistemas', 'Arquitetura e Urbanismo',
  'Biomedicina', 'Ciência da Computação', 'Ciências Biológicas', 'Ciências Contábeis',
  'Ciências Econômicas', 'Design Gráfico', 'Direito', 'Enfermagem', 'Engenharia Civil',
  'Engenharia de Computação', 'Engenharia de Produção', 'Engenharia de Software',
  'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Farmácia',
  'Fisioterapia', 'História', 'Jornalismo', 'Letras', 'Medicina', 'Medicina Veterinária',
  'Nutrição', 'Odontologia', 'Pedagogia', 'Psicologia', 'Publicidade e Propaganda',
  'Sistemas de Informação',
];

@Component({
  standalone: true,
  selector: 'app-aluno-form-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    FormFieldComponent,
  ],
  templateUrl: './aluno-form-page.html',
  styleUrl: './aluno-form-page.css',
})
export class AlunoFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private alunoService = inject(AlunoService);
  private instituicaoService = inject(InstituicaoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  protected cursos = CURSOS;
  protected instituicoes = signal<InstituicaoItem[]>([]);
  protected saving = signal(false);
  protected alunoId = signal<number | null>(null);

  protected isEdit = () => this.alunoId() !== null;
  protected invalid = (field: string) => {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  };

  protected form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: [''],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    rg: ['', Validators.required],
    curso: ['', Validators.required],
    endereco: [''],
    instituicaoId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.instituicaoService.listar().subscribe((list) => this.instituicoes.set(list));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.alunoId.set(Number(id));
      this.form.controls.senha.clearValidators();
      this.form.controls.senha.updateValueAndValidity();
      this.alunoService.buscar(Number(id)).subscribe({
        next: (a) => this.form.patchValue({
          nome: a.nome,
          email: a.email,
          cpf: a.cpf,
          rg: a.rg,
          curso: a.curso,
          endereco: a.endereco ?? '',
          instituicaoId: a.instituicaoId,
          senha: '',
        }),
        error: () => this.snack.open('Aluno não encontrado.', 'Fechar', { duration: 4000 }),
      });
    } else {
      this.form.controls.senha.addValidators([Validators.required, Validators.minLength(6)]);
      this.form.controls.senha.updateValueAndValidity();
    }
  }

  cancel(): void {
    this.router.navigate([this.isEdit() ? '/alunos' : '/login']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const dto = this.form.getRawValue() as AlunoPayload;
    const obs = this.isEdit()
      ? this.alunoService.atualizar(this.alunoId()!, dto)
      : this.alunoService.cadastrar(dto);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(this.isEdit() ? 'Aluno atualizado.' : 'Cadastro concluído. Faça login.', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.router.navigate([this.isEdit() ? '/alunos' : '/login']);
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
    return 'Erro ao salvar aluno.';
  }
}
