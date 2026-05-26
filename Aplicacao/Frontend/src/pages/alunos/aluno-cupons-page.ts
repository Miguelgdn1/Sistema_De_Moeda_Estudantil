import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ResgateService } from '../../services/resgate.service';
import { TransacaoItem } from '../../models/transacao.model';
import { CupomStatus } from '../../models/resgate.model';
import { environment } from '../../environments/environment';

interface CupomVisual extends TransacaoItem {
  status: CupomStatus;
  qrCodeBase64: string;
}

@Component({
  standalone: true,
  selector: 'app-aluno-cupons-page',
  imports: [
    CommonModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aluno-cupons-page.html',
  styleUrl: './aluno-cupons-page.css',
})
export class AlunoCuponsPage implements OnInit {
  private readonly resgateService = inject(ResgateService);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = signal(true);
  protected cupons = signal<CupomVisual[]>([]);
  protected cupomAberto = signal<CupomVisual | null>(null);
  protected isEmpty = computed(() => !this.loading() && this.cupons().length === 0);

  protected qrUrl(codigo: string | null | undefined): string {
    if (!codigo) return '';
    return `${environment.apiUrl}/cupons/${codigo}/qr-code`;
  }

  ngOnInit(): void {
    this.resgateService.meusCupons()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          const agora = new Date();
          const visuais: CupomVisual[] = list.map((t) => ({
            ...t,
            status: this.calcularStatus(t, agora),
            qrCodeBase64: '',
          }));
          this.cupons.set(visuais);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open(err?.error?.message || 'Erro ao carregar cupons.',
            'Fechar', { duration: 4000, panelClass: ['snackbar-error'] });
        },
      });
  }

  protected abrir(c: CupomVisual): void {
    this.cupomAberto.set(c);
  }

  protected fechar(): void {
    this.cupomAberto.set(null);
  }

  protected statusLabel(s: CupomStatus): string {
    switch (s) {
      case 'VALIDO': return 'Valido';
      case 'EXPIRADO': return 'Expirado';
      case 'UTILIZADO': return 'Utilizado';
    }
  }

  protected statusClass(s: CupomStatus): string {
    switch (s) {
      case 'VALIDO': return 'badge valido';
      case 'EXPIRADO': return 'badge expirado';
      case 'UTILIZADO': return 'badge utilizado';
    }
  }

  private calcularStatus(t: TransacaoItem, agora: Date): CupomStatus {
    if (t.cupomUsadoEm) return 'UTILIZADO';
    if (t.dataExpiracao && new Date(t.dataExpiracao) < agora) return 'EXPIRADO';
    return 'VALIDO';
  }
}
