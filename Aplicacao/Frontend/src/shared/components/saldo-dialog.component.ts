import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from './button.component';

@Component({
  standalone: true,
  selector: 'app-saldo-dialog',
  imports: [CommonModule, FormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overlay" (click)="onCancel()" role="presentation"></div>
    <div class="dialog" role="dialog" aria-modal="true" [attr.aria-label]="'Ajustar saldo de ' + nome">
      <header class="dialog__head">
        <h3>Ajustar saldo</h3>
        <button type="button" class="icon-btn" (click)="onCancel()" aria-label="Fechar">
          <span class="material-icons">close</span>
        </button>
      </header>

      <div class="dialog__body">
        <p class="subject"><strong>{{ nome }}</strong></p>
        <p class="current">Saldo atual: <strong>M$ {{ saldoAtual }}</strong></p>

        <label class="field">
          <span>Quantidade</span>
          <input
            type="number"
            [(ngModel)]="quantidade"
            (keydown.enter)="onConfirm()"
            placeholder="Ex.: 100 ou -50"
            autofocus
          >
        </label>
        <p class="hint">Use um valor positivo para adicionar moedas; negativo para remover.</p>

        @if (quantidade !== 0) {
          <p class="preview">
            Novo saldo: <strong>M$ {{ saldoAtual + quantidade }}</strong>
            @if (saldoAtual + quantidade < 0) {
              <span class="error"> — saldo ficaria negativo, ajuste o valor.</span>
            }
          </p>
        }
      </div>

      <footer class="dialog__foot">
        <app-button variant="secondary" (click)="onCancel()">Cancelar</app-button>
        <app-button variant="primary" [loading]="loading" [disabled]="!isValid()" (click)="onConfirm()">
          Confirmar
        </app-button>
      </footer>
    </div>
  `,
  styles: [`
    :host { position: fixed; inset: 0; z-index: 1000; display: block; }
    .overlay {
      position: absolute; inset: 0;
      background: var(--color-overlay);
      animation: fade .15s ease-out;
    }
    .dialog {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: min(440px, calc(100vw - 32px));
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      animation: pop .18s ease-out;
      display: flex; flex-direction: column;
    }
    .dialog__head {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--color-border);
    }
    .dialog__head h3 { margin: 0; font-size: var(--text-lg); color: var(--color-text); }
    .dialog__body { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
    .dialog__foot {
      display: flex; justify-content: flex-end; gap: var(--space-2);
      padding: var(--space-4) var(--space-5);
      border-top: 1px solid var(--color-border);
    }
    .subject { margin: 0; font-size: var(--text-base); color: var(--color-text); }
    .current { margin: 0; color: var(--color-text-muted); }
    .field { display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-text); }
    .field input {
      padding: var(--space-3); border: 1px solid var(--color-border-strong); border-radius: var(--radius-md);
      font-size: var(--text-base); font-variant-numeric: tabular-nums;
      outline: none; transition: border-color .15s;
    }
    .field input:focus { border-color: var(--color-brand); box-shadow: 0 0 0 3px var(--color-brand-soft); }
    .hint { margin: 0; font-size: var(--text-xs); color: var(--color-text-muted); }
    .preview { margin: 0; font-size: var(--text-sm); color: var(--color-text); }
    .preview .error { color: var(--color-danger); font-weight: 600; }
    .icon-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: var(--radius-md);
      background: transparent; color: var(--color-text-muted); cursor: pointer;
    }
    .icon-btn:hover { background: var(--color-surface-alt); color: var(--color-text); }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pop {
      from { opacity: 0; transform: translate(-50%, -45%); }
      to   { opacity: 1; transform: translate(-50%, -50%); }
    }
  `],
})
export class SaldoDialogComponent {
  @Input({ required: true }) nome = '';
  @Input({ required: true }) saldoAtual = 0;
  @Input() loading = false;

  @Output() confirm = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();

  protected quantidade = 0;

  isValid(): boolean {
    return this.quantidade !== 0 && this.saldoAtual + this.quantidade >= 0;
  }

  onConfirm(): void {
    if (!this.isValid() || this.loading) return;
    this.confirm.emit(this.quantidade);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
