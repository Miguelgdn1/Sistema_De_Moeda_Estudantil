import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TransactionView {
  id: number;
  dataHora: string | Date;
  descricao: string;
  direction: 'in' | 'out';
  valor: number;
  contraparte?: string | null;
}

@Component({
  standalone: true,
  selector: 'app-transaction-item',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-item.component.html',
  styleUrl: './transaction-item.component.css',
})
export class TransactionItemComponent {
  @Input({ required: true }) transaction!: TransactionView;
  protected iso(v: string | Date): string {
    return (v instanceof Date ? v : new Date(v)).toISOString();
  }
}
