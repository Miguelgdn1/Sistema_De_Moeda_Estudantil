import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfessorService } from '../../services/professor.service';
import { ExtratoItem } from '../../models/transacao.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { TransactionListComponent } from '../../shared/components/transaction-list.component';
import { TransactionView } from '../../shared/components/transaction-item.component';

@Component({
  standalone: true,
  selector: 'app-professor-extrato-page',
  imports: [CommonModule, AppShellComponent, PageHeaderComponent, TransactionListComponent],
  templateUrl: './professor-extrato-page.html',
  styleUrl: './professor-extrato-page.css',
})
export class ProfessorExtratoPage implements OnInit {
  private auth = inject(AuthService);
  private professorService = inject(ProfessorService);

  protected extrato = signal<ExtratoItem | null>(null);
  protected loading = signal(true);

  protected views = computed<TransactionView[]>(() =>
    (this.extrato()?.transacoes ?? []).map((t) => ({
      id: t.id,
      dataHora: t.dataHora,
      descricao: t.descricao,
      direction: 'out',
      valor: t.valor,
      contraparte: t.alunoNome ? `Para ${t.alunoNome}` : null,
    }))
  );

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.professorService.getExtrato(user.id).subscribe({
      next: (e) => { this.extrato.set(e); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
