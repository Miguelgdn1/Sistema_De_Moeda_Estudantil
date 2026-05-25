import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmpresaService } from '../../services/empresa.service';
import { EmpresaItem } from '../../models/empresa.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  standalone: true,
  selector: 'app-empresa-list-page',
  imports: [CommonModule, RouterLink, AppShellComponent, PageHeaderComponent, CardComponent, ButtonComponent, EmptyStateComponent],
  templateUrl: './empresa-list-page.html',
  styleUrl: './empresa-list-page.css',
})
export class EmpresaListPage implements OnInit {
  private empresaService = inject(EmpresaService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  protected empresas = signal<EmpresaItem[]>([]);
  protected loading = signal(true);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.empresaService.listar().subscribe({
      next: (res) => { this.empresas.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snack.open('Erro ao carregar empresas.', 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] }); },
    });
  }

  editar(id: number): void { this.router.navigate(['/empresas', id, 'editar']); }

  excluir(e: EmpresaItem): void {
    if (!confirm(`Excluir empresa "${e.nomeFantasia}"?`)) return;
    this.empresaService.deletar(e.id).subscribe({
      next: () => { this.snack.open('Empresa excluída.', 'Fechar', { duration: 3000, panelClass: ['snackbar-success'] }); this.carregar(); },
      error: (err) => this.snack.open(err?.error?.message ?? err?.error?.mensagem ?? 'Erro ao excluir.', 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] }),
    });
  }
}
