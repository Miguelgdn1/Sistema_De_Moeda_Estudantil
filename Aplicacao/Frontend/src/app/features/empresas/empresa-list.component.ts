import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmpresaService } from '../../core/services/empresa.service';
import { AuthService } from '../../core/services/auth.service';
import { EmpresaResponse } from '../../core/models/api-models';

@Component({
  standalone: true,
  selector: 'app-empresa-list',
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>🏢 Empresas Parceiras</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/alunos">Alunos</a>
      <button mat-icon-button (click)="logout()" matTooltip="Sair">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="container">
      <div class="header">
        <h2>Lista de Empresas Parceiras</h2>
        <a mat-flat-button color="primary" routerLink="/empresas/novo">
          <mat-icon>add</mat-icon> Nova Empresa
        </a>
      </div>

      @if (loading()) {
        <mat-spinner class="center" diameter="48"></mat-spinner>
      } @else if (empresas().length === 0) {
        <p class="empty">Nenhuma empresa cadastrada.</p>
      } @else {
        <table mat-table [dataSource]="empresas()" class="mat-elevation-z2 full-width">
          <ng-container matColumnDef="nomeFantasia">
            <th mat-header-cell *matHeaderCellDef>Nome Fantasia</th>
            <td mat-cell *matCellDef="let e">{{ e.nomeFantasia }}</td>
          </ng-container>
          <ng-container matColumnDef="cnpj">
            <th mat-header-cell *matHeaderCellDef>CNPJ</th>
            <td mat-cell *matCellDef="let e">{{ e.cnpj }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let e">{{ e.email }}</td>
          </ng-container>
          <ng-container matColumnDef="descricao">
            <th mat-header-cell *matHeaderCellDef>Descrição</th>
            <td mat-cell *matCellDef="let e">{{ e.descricao || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let e">
              <button mat-icon-button (click)="editar(e.id)" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="excluir(e)" matTooltip="Excluir">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>
      }
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .center { margin: 48px auto; display: block; }
    .empty { text-align: center; color: #666; margin-top: 48px; }
  `],
})
export class EmpresaListComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  empresas = signal<EmpresaResponse[]>([]);
  loading = signal(true);
  cols = ['nomeFantasia', 'cnpj', 'email', 'descricao', 'acoes'];

  ngOnInit(): void {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.empresaService.listar().subscribe({
      next: (res) => {
        this.empresas.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Erro ao carregar empresas.', 'Fechar', { duration: 4000 });
      },
    });
  }

  editar(id: number) {
    this.router.navigate(['/empresas', id, 'editar']);
  }

  excluir(e: EmpresaResponse) {
    if (!confirm(`Excluir empresa "${e.nomeFantasia}"?`)) return;
    this.empresaService.deletar(e.id).subscribe({
      next: () => {
        this.snack.open('Empresa excluída.', 'Fechar', { duration: 3000 });
        this.carregar();
      },
      error: (err) => {
        const msg = err?.error?.mensagem ?? 'Erro ao excluir empresa.';
        this.snack.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
