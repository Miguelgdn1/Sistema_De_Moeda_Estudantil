import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VantagemService } from '../../services/vantagem.service';
import { VantagemPayload } from '../../models/vantagem.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { FormFieldComponent } from '../../shared/components/form-field.component';

@Component({
  standalone: true,
  selector: 'app-vantagem-form-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    FormFieldComponent,
  ],
  templateUrl: './vantagem-form-page.html',
  styleUrl: './vantagem-form-page.css',
})
export class VantagemFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private vantagemService = inject(VantagemService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  protected saving = signal(false);
  protected vantagemId = signal<number | null>(null);
  protected fotoPreview = signal<string>('');

  protected isEdit = () => this.vantagemId() !== null;
  protected invalid = (field: string) => {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  };

  protected form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(255)]],
    descricao: [''],
    custoMoedas: [0, [Validators.required, Validators.min(1)]],
    fotoUrl: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vantagemId.set(Number(id));
      this.vantagemService.buscar(Number(id))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (v) => {
            this.form.patchValue({
              nome: v.nome,
              descricao: v.descricao ?? '',
              custoMoedas: v.custoMoedas,
              fotoUrl: v.fotoUrl ?? '',
            });
            this.fotoPreview.set(v.fotoUrl ?? '');
          },
          error: () => this.snack.open('Vantagem nao encontrada.', 'Fechar', { duration: 4000 }),
        });
    }

    this.form.controls.fotoUrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((url) => this.fotoPreview.set(url ?? ''));
  }

  cancel(): void {
    this.router.navigate(['/empresas/vantagens']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const dto: VantagemPayload = {
      nome: v.nome,
      descricao: v.descricao?.trim() || undefined,
      custoMoedas: Number(v.custoMoedas),
      fotoUrl: v.fotoUrl?.trim() || undefined,
    };

    const obs = this.isEdit()
      ? this.vantagemService.atualizar(this.vantagemId()!, dto)
      : this.vantagemService.cadastrar(dto);

    obs
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snack.open(this.isEdit() ? 'Vantagem atualizada.' : 'Vantagem cadastrada.',
            'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
          this.router.navigate(['/empresas/vantagens']);
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message || err?.error?.mensagem || 'Erro ao salvar vantagem.';
          this.snack.open(msg, 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] });
        },
      });
  }
}
