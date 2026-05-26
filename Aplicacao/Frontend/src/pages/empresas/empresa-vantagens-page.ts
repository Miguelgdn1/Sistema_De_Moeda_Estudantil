import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { AuthService } from '../../services/auth.service';
import { VantagemService } from '../../services/vantagem.service';
import { VantagemItem } from '../../models/vantagem.model';

@Component({
  standalone: true,
  selector: 'app-empresa-vantagens-page',
  imports: [
    CommonModule,
    AppShellComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empresa-vantagens-page.html',
  styleUrl: './empresa-vantagens-page.css',
})
export class EmpresaVantagensPage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly vantagemService = inject(VantagemService);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = signal(true);
  protected vantagens = signal<VantagemItem[]>([]);
  protected isEmpty = computed(() => !this.loading() && this.vantagens().length === 0);

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.tipoUsuario !== 'EMPRESA') {
      this.router.navigate(['/login']);
      return;
    }
    this.loading.set(true);
    this.vantagemService.listarPorEmpresa(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.vantagens.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open(this.errMsg(err, 'Erro ao carregar vantagens.'), 'Fechar',
            { duration: 4000, panelClass: ['snackbar-error'] });
        },
      });
  }

  protected nova(): void {
    this.router.navigate(['/empresas/vantagens/nova']);
  }

  protected editar(v: VantagemItem): void {
    this.router.navigate(['/empresas/vantagens', v.id, 'editar']);
  }

  protected excluir(v: VantagemItem): void {
    if (!confirm(`Excluir a vantagem "${v.nome}"? Esta acao nao pode ser desfeita.`)) {
      return;
    }
    this.vantagemService.excluir(v.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open('Vantagem excluida.', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
          this.carregar();
        },
        error: (err) => {
          this.snack.open(this.errMsg(err, 'Erro ao excluir.'), 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] });
        },
      });
  }

  private errMsg(err: any, fallback: string): string {
    return err?.error?.message || err?.error?.mensagem || fallback;
  }
}
