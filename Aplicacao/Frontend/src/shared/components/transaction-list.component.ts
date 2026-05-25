import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionItemComponent, TransactionView } from './transaction-item.component';
import { EmptyStateComponent } from './empty-state.component';

@Component({
  standalone: true,
  selector: 'app-transaction-list',
  imports: [CommonModule, TransactionItemComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css',
})
export class TransactionListComponent {
  @Input() transactions: TransactionView[] = [];
  @Input() loading = false;
  @Input() emptyTitle = 'Nenhuma transação encontrada';
  @Input() emptyDescription = 'Quando houver movimentações de moedas, elas aparecerão aqui.';
}
