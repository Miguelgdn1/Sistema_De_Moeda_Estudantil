import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpresaService } from '../../core/services/empresa.service';
import { AuthService } from '../../core/services/auth.service';
import { TransacaoResponse } from '../../core/models/api-models';

@Component({
  standalone: true,
  selector: 'app-empresa-relatorio',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relatorio-container">
      <header class="relatorio-header">
        <a routerLink="/home" class="back-link"><i class='bx bx-arrow-back'></i> Voltar</a>
        <div class="header-copy">
          <h1>Relatório de Trocas</h1>
          <p class="subtitle">Histórico de alunos que resgataram vantagens oferecidas pela sua empresa.</p>
        </div>
        <div class="header-badge">Total de registros: {{ trocas().length }}</div>
      </header>

      <main class="relatorio-main">
        <section *ngIf="loading()" class="loading">Carregando histórico de trocas...</section>

        <table *ngIf="!loading() && trocas().length > 0" class="relatorio-table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Aluno</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th class="coins">Moedas</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of trocas()">
              <td>{{ t.dataHora | date:'short' }}</td>
              <td>{{ t.alunoNome ?? ('#' + (t.alunoId ?? '-')) }}</td>
              <td>{{ t.descricao }}</td>
              <td>{{ t.tipo }}</td>
              <td class="coins">{{ t.valor }}</td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading() && trocas().length === 0" class="empty-state">
          <p>Nenhuma troca registrada para sua empresa ainda.</p>
          <span>Quando um aluno resgatar uma vantagem, ela aparecerá aqui automaticamente.</span>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
    .relatorio-container {
      max-width: 1040px; margin: 32px auto; padding: 20px;
    }
    .relatorio-header {
      display: grid; grid-template-columns: auto auto; align-items: center; gap: 20px;
      padding: 24px 28px; border-radius: 18px; background: var(--bg-card);
      box-shadow: 0 20px 50px rgba(0,0,0,0.08);
    }
    .header-copy { display: grid; gap: 6px; }
    .relatorio-header h1 { margin: 0; font-size: 1.9rem; color: var(--text-dark); }
    .subtitle { margin: 0; color: var(--text-muted); font-size: 0.98rem; line-height: 1.5; }
    .header-badge {
      justify-self: end; padding: 12px 18px; border-radius: 999px;
      background: rgba(27, 113, 167, 0.12); color: var(--text-dark); font-weight: 700;
    }
    .back-link { color: var(--secondary); text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; }
    .back-link:hover { opacity: 0.88; }

    .relatorio-main {
      margin-top: 24px; padding: 28px; border-radius: 18px; background: var(--bg-card);
      box-shadow: 0 20px 50px rgba(0,0,0,0.06);
    }
    .loading,
    .empty-state {
      min-height: 160px; display: grid; place-items: center; color: var(--text-muted);
      font-size: 1rem; text-align: center;
    }
    .empty-state span { display: block; margin-top: 10px; font-size: 0.95rem; color: var(--text-muted); }

    .relatorio-table {
      width: 100%; border-collapse: separate; border-spacing: 0 10px;
      margin-top: 10px;
    }
    .relatorio-table th,
    .relatorio-table td {
      padding: 16px 18px; background: var(--bg-main); border: none;
    }
    .relatorio-table thead th {
      background: transparent; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;
      font-size: 0.82rem; font-weight: 700; border-bottom: 1px solid rgba(0,0,0,0.08);
    }
    .relatorio-table tbody tr { box-shadow: 0 8px 20px rgba(0,0,0,0.04); border-radius: 14px; }
    .relatorio-table tbody tr:hover { transform: translateY(-1px); transition: transform 0.2s ease; }
    .relatorio-table td { color: var(--text-dark); font-size: 0.95rem; }
    .coins { text-align: right; font-weight: 700; }

    @media (max-width: 860px) {
      .relatorio-header { grid-template-columns: 1fr; text-align: left; }
      .header-badge { justify-self: start; }
    }
    @media (max-width: 680px) {
      .relatorio-main { padding: 20px 18px; }
      .relatorio-table th, .relatorio-table td { padding: 14px 12px; }
    }
  `]
})
export class EmpresaRelatorioComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private auth = inject(AuthService);

  loading = signal(true);
  trocas = signal<TransacaoResponse[]>([]);

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user || user.tipoUsuario?.toUpperCase() !== 'EMPRESA') {
      this.loading.set(false);
      this.trocas.set([]);
      return;
    }

    const id = user.id;
    this.empresaService.relatorioTrocas(id).subscribe({
      next: (res) => { this.trocas.set(res); this.loading.set(false); },
      error: () => { this.trocas.set([]); this.loading.set(false); }
    });
  }
}
