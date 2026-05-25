import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfessorService } from '../../services/professor.service';
import { AlunoService } from '../../services/aluno.service';
import { AuthService } from '../../services/auth.service';
import { AlunoItem } from '../../models/aluno.model';
import { DistribuirMoedasPayload, ProfessorItem } from '../../models/professor.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { FormFieldComponent } from '../../shared/components/form-field.component';

@Component({
  standalone: true,
  selector: 'app-distribuir-moedas-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    FormFieldComponent,
  ],
  templateUrl: './distribuir-moedas-page.html',
  styleUrl: './distribuir-moedas-page.css',
})
export class DistribuirMoedasPage implements OnInit {
  private fb = inject(FormBuilder);
  private professorService = inject(ProfessorService);
  private alunoService = inject(AlunoService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  protected professor = signal<ProfessorItem | null>(null);
  protected alunos = signal<AlunoItem[]>([]);
  protected saving = signal(false);

  protected form = this.fb.nonNullable.group({
    alunoId: [0, [Validators.required, Validators.min(1)]],
    quantidade: [0, [Validators.required, Validators.min(1)]],
    mensagem: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  protected invalid = (field: string) => {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  };
  protected maxQuantidade = computed(() => this.professor()?.saldoMoedas ?? 0);
  protected saldoInsuficiente = computed(() => {
    const q = this.form.controls.quantidade.value;
    return q > 0 && q > this.maxQuantidade();
  });
  protected quantidadeValida = computed(() => {
    const q = this.form.controls.quantidade.value;
    return q > 0 && q <= this.maxQuantidade();
  });
  protected saldoAposEnvio = computed(() => Math.max(0, this.maxQuantidade() - (this.form.controls.quantidade.value || 0)));

  ngOnInit(): void {
    this.professorService.getMe().subscribe({ next: (p) => this.professor.set(p) });
    this.alunoService.listar().subscribe({ next: (list) => this.alunos.set(list) });
  }

  cancel(): void {
    this.router.navigate(['/professor/painel']);
  }

  onSubmit(): void {
    if (this.form.invalid || this.saldoInsuficiente()) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.saving.set(true);
    const dto = this.form.getRawValue() as DistribuirMoedasPayload;

    this.professorService.distribuir(user.id, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open('Moedas enviadas com sucesso!', 'Fechar', { duration: 3500, panelClass: ['snackbar-success'] });
        this.router.navigate(['/professor/painel']);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? err?.error?.mensagem ?? 'Erro ao enviar moedas.';
        this.snack.open(msg, 'Fechar', { duration: 4500, panelClass: ['snackbar-error'] });
      },
    });
  }
}
