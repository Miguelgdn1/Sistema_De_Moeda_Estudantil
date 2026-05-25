import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresaService } from '../../services/empresa.service';
import { AuthService } from '../../services/auth.service';
import { TransacaoItem } from '../../models/transacao.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  standalone: true,
  selector: 'app-empresa-relatorio-page',
  imports: [CommonModule, AppShellComponent, PageHeaderComponent, CardComponent, EmptyStateComponent],
  templateUrl: './empresa-relatorio-page.html',
  styleUrl: './empresa-relatorio-page.css',
})
export class EmpresaRelatorioPage implements OnInit {
  private empresaService = inject(EmpresaService);
  private auth = inject(AuthService);

  protected loading = signal(true);
  protected trocas = signal<TransacaoItem[]>([]);

  protected totalMoedas = computed(() => this.trocas().reduce((sum, t) => sum + (t.valor || 0), 0));
  protected alunosUnicos = computed(() => new Set(this.trocas().map((t) => t.alunoId).filter(Boolean)).size);

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user || user.tipoUsuario !== 'EMPRESA') {
      this.loading.set(false);
      return;
    }
    this.empresaService.relatorioTrocas(user.id).subscribe({
      next: (list) => { this.trocas.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
