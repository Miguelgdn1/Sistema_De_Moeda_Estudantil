import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CurrentUser } from '../../models/user-role.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, AppShellComponent, CardComponent, ButtonComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private auth = inject(AuthService);
  protected user = signal<CurrentUser | null>(null);

  ngOnInit(): void {
    this.user.set(this.auth.getCurrentUser());
  }

  protected homeRoute(): string {
    const role = this.user()?.tipoUsuario;
    switch (role) {
      case 'ALUNO': return '/alunos/painel';
      case 'PROFESSOR': return '/professor/painel';
      case 'EMPRESA': return '/empresas/vantagens';
      case 'ADMIN': return '/alunos';
      default: return '/login';
    }
  }
}
