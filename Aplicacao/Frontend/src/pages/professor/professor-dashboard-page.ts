import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProfessorService } from '../../services/professor.service';
import { ProfessorItem } from '../../models/professor.model';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';

@Component({
  standalone: true,
  selector: 'app-professor-dashboard-page',
  imports: [CommonModule, RouterLink, AppShellComponent, PageHeaderComponent, CardComponent, ButtonComponent],
  templateUrl: './professor-dashboard-page.html',
  styleUrl: './professor-dashboard-page.css',
})
export class ProfessorDashboardPage implements OnInit {
  private professorService = inject(ProfessorService);

  protected professor = signal<ProfessorItem | null>(null);
  protected firstName = () => this.professor()?.nome.split(' ')[0] ?? '';

  ngOnInit(): void {
    this.professorService.getMe().subscribe({
      next: (p) => this.professor.set(p),
    });
  }
}
