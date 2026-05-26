import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfessorService } from '../../services/professor.service';
import { ProfessorItem } from '../../models/professor.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { SaldoDialogComponent } from '../../shared/components/saldo-dialog.component';

@Component({
  standalone: true,
  selector: 'app-professor-list-page',
  imports: [CommonModule, RouterLink, AppShellComponent, PageHeaderComponent, CardComponent, ButtonComponent, EmptyStateComponent, SaldoDialogComponent],
  templateUrl: './professor-list-page.html',
  styleUrl: './professor-list-page.css',
})
export class ProfessorListPage implements OnInit {
  private professorService = inject(ProfessorService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  protected professores = signal<ProfessorItem[]>([]);
  protected loading = signal(true);
  protected ajusteAlvo = signal<ProfessorItem | null>(null);
  protected ajusteSaving = signal(false);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.professorService.listar().subscribe({
      next: (res) => { this.professores.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snack.open('Erro ao carregar professores.', 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] }); },
    });
  }

  editar(id: number): void { this.router.navigate(['/professores', id, 'editar']); }

  excluir(p: ProfessorItem): void {
    if (!confirm(`Excluir professor "${p.nome}"?`)) return;
    this.professorService.deletar(p.id).subscribe({
      next: () => { this.snack.open('Professor excluído.', 'Fechar', { duration: 3000, panelClass: ['snackbar-success'] }); this.carregar(); },
      error: (err) => this.snack.open(err?.error?.message ?? err?.error?.mensagem ?? 'Erro ao excluir.', 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] }),
    });
  }

  abrirAjuste(p: ProfessorItem): void { this.ajusteAlvo.set(p); }
  fecharAjuste(): void { if (!this.ajusteSaving()) this.ajusteAlvo.set(null); }

  confirmarAjuste(quantidade: number): void {
    const alvo = this.ajusteAlvo();
    if (!alvo) return;
    this.ajusteSaving.set(true);
    this.professorService.ajustarSaldo(alvo.id, quantidade).subscribe({
      next: (atualizado) => {
        this.ajusteSaving.set(false);
        this.ajusteAlvo.set(null);
        this.professores.update((list) => list.map((p) => p.id === atualizado.id ? atualizado : p));
        const verbo = quantidade > 0 ? 'adicionadas a' : 'removidas de';
        this.snack.open(`M$ ${Math.abs(quantidade)} ${verbo} ${atualizado.nome}.`, 'Fechar', { panelClass: ['snackbar-success'] });
      },
      error: (err) => {
        this.ajusteSaving.set(false);
        const msg = err?.error?.message ?? err?.error?.mensagem ?? 'Erro ao ajustar saldo.';
        this.snack.open(msg, 'Fechar', { panelClass: ['snackbar-error'] });
      },
    });
  }
}
