import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavLink {
  label: string;
  to: string;
  icon: string;
}

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected user = signal(this.auth.getCurrentUser());
  protected menuOpen = signal(false);
  protected year = new Date().getFullYear();

  protected navLinks = computed<NavLink[]>(() => {
    const u = this.user();
    if (!u) return [];
    const role = u.tipoUsuario?.toUpperCase();
    switch (role) {
      case 'ALUNO':
        return [
          { label: 'Painel', to: '/alunos/painel', icon: 'dashboard' },
          { label: 'Extrato', to: '/alunos/extrato', icon: 'receipt_long' },
          { label: 'Perfil', to: '/alunos/editar-perfil', icon: 'person' },
        ];
      case 'PROFESSOR':
        return [
          { label: 'Painel', to: '/professor/painel', icon: 'dashboard' },
          { label: 'Distribuir', to: '/professor/distribuir', icon: 'send' },
          { label: 'Extrato', to: '/professor/extrato', icon: 'receipt_long' },
        ];
      case 'EMPRESA':
        return [
          { label: 'Perfil', to: '/empresas/editar', icon: 'business' },
          { label: 'Vantagens', to: '/empresas/vantagens', icon: 'redeem' },
          { label: 'Trocas', to: '/empresas/relatorio', icon: 'receipt_long' },
        ];
      case 'ADMIN':
        return [
          { label: 'Alunos', to: '/alunos', icon: 'group' },
          { label: 'Empresas', to: '/empresas', icon: 'business' },
        ];
      default:
        return [];
    }
  });

  protected initials(): string {
    const u = this.user();
    if (!u?.nome) return '?';
    return u.nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('');
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
