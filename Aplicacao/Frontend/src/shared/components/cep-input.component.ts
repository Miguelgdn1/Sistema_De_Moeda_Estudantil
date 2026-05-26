import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { CepService } from '../../services/cep.service';
import { EnderecoEstruturado } from '../../models/endereco.model';

@Component({
  standalone: true,
  selector: 'app-cep-input',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cep-input">
      <input
        type="text"
        [placeholder]="placeholder"
        [value]="formatado()"
        (input)="onChange($any($event.target).value)"
        (blur)="onBlur()"
        maxlength="9"
        autocomplete="postal-code"
        [class.error]="errorMsg"
      />
      <span class="status" *ngIf="loading">buscando...</span>
      <span class="status error-msg" *ngIf="errorMsg">{{ errorMsg }}</span>
    </div>
  `,
  styles: [`
    .cep-input { display: flex; align-items: center; gap: 8px; }
    .cep-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 14px;
    }
    .cep-input input.error { border-color: #dc2626; }
    .status { font-size: 12px; color: #6b7280; }
    .error-msg { color: #dc2626; }
  `],
})
export class CepInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = '00000-000';
  @Input() value: string | undefined = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() enderecoEncontrado = new EventEmitter<EnderecoEstruturado>();

  loading = false;
  errorMsg = '';

  private readonly cepService = inject(CepService);
  private readonly query$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.query$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((cep) => {
          const numeros = cep.replace(/\D/g, '');
          if (numeros.length !== 8) {
            this.loading = false;
            this.errorMsg = '';
            return [];
          }
          this.loading = true;
          this.errorMsg = '';
          return this.cepService.buscar(numeros);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((resp) => {
        this.loading = false;
        if (!resp) {
          this.errorMsg = 'CEP nao encontrado.';
          return;
        }
        this.enderecoEncontrado.emit(resp);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onChange(raw: string): void {
    const numeros = (raw ?? '').replace(/\D/g, '').slice(0, 8);
    this.value = numeros;
    this.valueChange.emit(numeros);
    this.query$.next(numeros);
  }

  onBlur(): void {
    if (this.value && this.value.replace(/\D/g, '').length !== 8) {
      this.errorMsg = 'CEP incompleto.';
    }
  }

  formatado(): string {
    const v = (this.value ?? '').replace(/\D/g, '');
    if (v.length <= 5) return v;
    return `${v.slice(0, 5)}-${v.slice(5, 8)}`;
  }
}
