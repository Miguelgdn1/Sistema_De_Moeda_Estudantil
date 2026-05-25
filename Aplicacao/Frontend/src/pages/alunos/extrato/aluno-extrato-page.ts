import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';
import { AlunoItem } from '../../../models/aluno.model';
import { TransacaoItem } from '../../../models/transacao.model';
import { AppShellComponent } from '../../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { CardComponent } from '../../../shared/components/card.component';
import { FormFieldComponent } from '../../../shared/components/form-field.component';
import { TransactionListComponent } from '../../../shared/components/transaction-list.component';
import { TransactionView } from '../../../shared/components/transaction-item.component';

type PeriodFilter = '7' | '30' | 'all';
type DirectionFilter = 'all' | 'in' | 'out';

@Component({
  standalone: true,
  selector: 'app-aluno-extrato-page',
  imports: [
    CommonModule,
    FormsModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    FormFieldComponent,
    TransactionListComponent,
  ],
  templateUrl: './aluno-extrato-page.html',
  styleUrl: './aluno-extrato-page.css',
})
export class AlunoExtratoPage implements OnInit {
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);
  private router = inject(Router);

  protected profile = signal<AlunoItem | null>(null);
  protected transactions = signal<TransacaoItem[]>([]);
  protected loading = signal(true);

  protected period = signal<PeriodFilter>('all');
  protected direction = signal<DirectionFilter>('all');

  protected periods = [
    { label: 'Últimos 7 dias', value: '7' as PeriodFilter },
    { label: 'Últimos 30 dias', value: '30' as PeriodFilter },
    { label: 'Tudo', value: 'all' as PeriodFilter },
  ];
  protected directions = [
    { label: 'Todas', value: 'all' as DirectionFilter },
    { label: 'Recebimentos', value: 'in' as DirectionFilter },
    { label: 'Resgates', value: 'out' as DirectionFilter },
  ];

  protected filtered = computed<TransactionView[]>(() => {
    const all = this.transactions();
    const cutoff = this.period() === 'all'
      ? null
      : new Date(Date.now() - parseInt(this.period(), 10) * 24 * 60 * 60 * 1000);

    return all
      .map<TransactionView>((t) => ({
        id: t.id,
        dataHora: t.dataHora,
        descricao: t.descricao,
        direction: t.tipo === 'ENVIO_MOEDA' ? 'in' : 'out',
        valor: t.valor,
        contraparte: null,
      }))
      .filter((t) => {
        if (this.direction() !== 'all' && t.direction !== this.direction()) return false;
        if (cutoff && new Date(t.dataHora) < cutoff) return false;
        return true;
      });
  });

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.profileService.getStudentProfile(user.id).subscribe({
      next: (p) => this.profile.set(p),
    });
    this.profileService.getStudentTransactions(user.id).subscribe({
      next: (list) => {
        this.transactions.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
