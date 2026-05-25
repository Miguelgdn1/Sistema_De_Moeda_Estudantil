import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CardComponent } from '../../shared/components/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  standalone: true,
  selector: 'app-empresa-vantagens-page',
  imports: [CommonModule, AppShellComponent, PageHeaderComponent, CardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empresa-vantagens-page.html',
})
export class EmpresaVantagensPage {}
