import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlunoService } from '../../core/services/aluno.service';
import { AuthService } from '../../core/services/auth.service';
import { AlunoResponse } from '../../core/models/api-models';

@Component({
  standalone: true,
  selector: 'app-aluno-list',
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
      <span>🎓 Alunos</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/empresas">Empresas</a>
      <button mat-icon-button (click)="logout()" matTooltip="Sair">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="container">
      <div class="header">
        <h2>Lista de Alunos</h2>
        <a mat-flat-button color="primary" routerLink="/alunos/novo">
          <mat-icon>add</mat-icon> Novo Aluno
        </a>
      </div>

      @if (loading()) {
        <mat-spinner class="center" diameter="48"></mat-spinner>
      } @else if (alunos().length === 0) {
        <p class="empty">Nenhum aluno cadastrado.</p>
      } @else {
        <table mat-table [dataSource]="alunos()" class="mat-elevation-z2 full-width">
          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef>Nome</th>
            <td mat-cell *matCellDef="let a">{{ a.nome }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let a">{{ a.email }}</td>
          </ng-container>
          <ng-container matColumnDef="cpf">
            <th mat-header-cell *matHeaderCellDef>CPF</th>
            <td mat-cell *matCellDef="let a">{{ a.cpf }}</td>
          </ng-container>
          <ng-container matColumnDef="curso">
            <th mat-header-cell *matHeaderCellDef>Curso</th>
            <td mat-cell *matCellDef="let a">{{ a.curso }}</td>
          </ng-container>
          <ng-container matColumnDef="instituicao">
            <th mat-header-cell *matHeaderCellDef>Instituição</th>
            <td mat-cell *matCellDef="let a">{{ a.instituicaoNome }}</td>
          </ng-container>
          <ng-container matColumnDef="saldo">
            <th mat-header-cell *matHeaderCellDef>Saldo</th>
            <td mat-cell *matCellDef="let a">{{ a.saldoMoedas }}</td>
          </ng-container>
          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let a">
              <button mat-icon-button (click)="editar(a.id)" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="excluir(a)" matTooltip="Excluir">
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
export class AlunoListComponent implements OnInit {
  private alunoService = inject(AlunoService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  alunos = signal<AlunoResponse[]>([]);
  loading = signal(true);
  cols = ['nome', 'email', 'cpf', 'curso', 'instituicao', 'saldo', 'acoes'];

  ngOnInit(): void {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.alunoService.listar().subscribe({
      next: (res) => {
        this.alunos.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Erro ao carregar alunos.', 'Fechar', { duration: 4000 });
      },
    });
  }

  editar(id: number) {
    this.router.navigate(['/alunos', id, 'editar']);
  }

  excluir(a: AlunoResponse) {
    if (!confirm(`Excluir aluno "${a.nome}"?`)) return;
    this.alunoService.deletar(a.id).subscribe({
      next: () => {
        this.snack.open('Aluno excluído.', 'Fechar', { duration: 3000 });
        this.carregar();
      },
      error: (err) => {
        const msg = err?.error?.mensagem ?? 'Erro ao excluir aluno.';
        this.snack.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
