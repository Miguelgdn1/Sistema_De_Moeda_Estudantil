import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlunoService } from '../../services/aluno.service';
import { AlunoItem } from '../../models/aluno.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  standalone: true,
  selector: 'app-aluno-list-page',
  imports: [CommonModule, RouterLink, AppShellComponent, PageHeaderComponent, CardComponent, ButtonComponent, EmptyStateComponent],
  templateUrl: './aluno-list-page.html',
  styleUrl: './aluno-list-page.css',
})
export class AlunoListPage implements OnInit {
  private alunoService = inject(AlunoService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  protected alunos = signal<AlunoItem[]>([]);
  protected loading = signal(true);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.alunoService.listar().subscribe({
      next: (res) => { this.alunos.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snack.open('Erro ao carregar alunos.', 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] }); },
    });
  }

  editar(id: number): void { this.router.navigate(['/alunos', id, 'editar']); }

  excluir(a: AlunoItem): void {
    if (!confirm(`Excluir aluno "${a.nome}"?`)) return;
    this.alunoService.deletar(a.id).subscribe({
      next: () => { this.snack.open('Aluno excluído.', 'Fechar', { duration: 3000, panelClass: ['snackbar-success'] }); this.carregar(); },
      error: (err) => this.snack.open(err?.error?.message ?? err?.error?.mensagem ?? 'Erro ao excluir.', 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] }),
    });
  }
}
