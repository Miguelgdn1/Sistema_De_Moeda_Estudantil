import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';

@Component({
  standalone: true,
  selector: 'app-aluno-dashboard-page',
  imports: [CommonModule, RouterLink, AppShellComponent, PageHeaderComponent, CardComponent, ButtonComponent],
  templateUrl: './aluno-dashboard-page.html',
  styleUrl: './aluno-dashboard-page.css',
})
export class AlunoDashboardPage implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  protected firstName = 'Aluno';
  protected saldo = signal(0);

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.firstName = user.nome.split(' ')[0];
    this.profileService.getStudentProfile(user.id).subscribe({
      next: (p) => this.saldo.set(p.saldoMoedas),
    });
  }
}
