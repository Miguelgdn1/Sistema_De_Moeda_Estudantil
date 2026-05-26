import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { VantagemService } from '../../services/vantagem.service';
import { ResgateService } from '../../services/resgate.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { VantagemItem } from '../../models/vantagem.model';
import { ResgateResultado } from '../../models/resgate.model';

@Component({
  standalone: true,
  selector: 'app-aluno-vantagens-page',
  imports: [
    CommonModule,
    FormsModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aluno-vantagens-page.html',
  styleUrl: './aluno-vantagens-page.css',
})
export class AlunoVantagensPage implements OnInit {
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly vantagemService = inject(VantagemService);
  private readonly resgateService = inject(ResgateService);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = signal(true);
  protected vantagens = signal<VantagemItem[]>([]);
  protected saldo = signal<number>(0);
  protected filtroEmpresa = signal<string>('');
  protected filtroCustoMax = signal<number | null>(null);
  protected confirmando = signal<VantagemItem | null>(null);
  protected resgateSucesso = signal<ResgateResultado | null>(null);
  protected resgatando = signal(false);

  protected empresas = computed(() => {
    const set = new Set<string>();
    for (const v of this.vantagens()) {
      if (v.empresaNomeFantasia) set.add(v.empresaNomeFantasia);
    }
    return Array.from(set).sort();
  });

  protected filtradas = computed(() => {
    const empresa = this.filtroEmpresa();
    const custoMax = this.filtroCustoMax();
    return this.vantagens().filter((v) => {
      if (empresa && v.empresaNomeFantasia !== empresa) return false;
      if (custoMax !== null && v.custoMoedas > custoMax) return false;
      return true;
    });
  });

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user || user.tipoUsuario !== 'ALUNO') {
      this.router.navigate(['/login']);
      return;
    }
    this.profileService.getStudentProfile(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (p) => this.saldo.set(p.saldoMoedas),
      });

    this.vantagemService.listarCatalogo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.vantagens.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open(this.errMsg(err, 'Erro ao carregar catalogo.'), 'Fechar',
            { duration: 4000, panelClass: ['snackbar-error'] });
        },
      });
  }

  protected podeResgatar(v: VantagemItem): boolean {
    return this.saldo() >= v.custoMoedas;
  }

  protected solicitar(v: VantagemItem): void {
    if (!this.podeResgatar(v)) {
      this.snack.open(`Saldo insuficiente. Voce tem M$ ${this.saldo()} e a vantagem custa M$ ${v.custoMoedas}.`,
        'Fechar', { duration: 4000, panelClass: ['snackbar-error'] });
      return;
    }
    this.confirmando.set(v);
  }

  protected fecharModal(): void {
    this.confirmando.set(null);
  }

  protected fecharSucesso(): void {
    this.resgateSucesso.set(null);
  }

  protected confirmar(): void {
    const v = this.confirmando();
    if (!v) return;
    this.resgatando.set(true);
    this.resgateService.resgatar(v.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.resgatando.set(false);
          this.confirmando.set(null);
          this.saldo.set(resultado.saldoRestante);
          this.resgateSucesso.set(resultado);
        },
        error: (err) => {
          this.resgatando.set(false);
          this.confirmando.set(null);
          this.snack.open(this.errMsg(err, 'Erro ao resgatar.'), 'Fechar',
            { duration: 4500, panelClass: ['snackbar-error'] });
        },
      });
  }

  protected setFiltroCusto(value: any): void {
    if (value === null || value === '' || value === undefined) {
      this.filtroCustoMax.set(null);
    } else {
      const n = Number(value);
      this.filtroCustoMax.set(isNaN(n) ? null : n);
    }
  }

  protected verCupons(): void {
    this.resgateSucesso.set(null);
    this.router.navigate(['/alunos/cupons']);
  }

  private errMsg(err: any, fallback: string): string {
    return err?.error?.message || err?.error?.mensagem || fallback;
  }
}
