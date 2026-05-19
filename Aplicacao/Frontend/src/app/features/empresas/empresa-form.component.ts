import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmpresaService } from '../../core/services/empresa.service';
import { AuthService } from '../../core/services/auth.service';
import { EmpresaRequest } from '../../core/models/api-models';

@Component({
  standalone: true,
  selector: 'app-empresa-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <div class="host-wrapper">
      <div class="wrapper__area">
        
        <div class="forms__area">
          <form class="login__form" [formGroup]="form" (ngSubmit)="onSubmit()">
            <h1 class="form__title">{{ isEdit() ? 'Editar Empresa' : 'Cadastrar Empresa Parceira' }}</h1>
            <div *ngIf="message()" class="alert" [class.success]="messageType() === 'success'" [class.error]="messageType() === 'error'">
              {{ message() }}
            </div>
            
            <div class="form-grid">
              <div class="input__group span-2" [class.formError]="form.get('nomeFantasia')?.invalid && form.get('nomeFantasia')?.touched">
                <label class="field">
                  <input type="text" formControlName="nomeFantasia" placeholder="Nome Fantasia da Empresa">
                </label>
                <span class="input__icon"><i class="bx bx-buildings"></i></span>
                <small class="input__error_message">Nome Fantasia é obrigatório</small>
              </div>

              <div class="input__group" [class.formError]="form.get('cnpj')?.invalid && form.get('cnpj')?.touched">
                <label class="field">
                  <input type="text" formControlName="cnpj" placeholder="CNPJ (14 dígitos)" maxlength="14">
                </label>
                <span class="input__icon"><i class="bx bx-receipt"></i></span>
                <small class="input__error_message">CNPJ inválido</small>
              </div>

              <div class="input__group" [class.formError]="form.get('email')?.invalid && form.get('email')?.touched">
                <label class="field">
                  <input type="email" formControlName="email" placeholder="Email Comercial">
                </label>
                <span class="input__icon"><i class="bx bx-envelope"></i></span>
                <small class="input__error_message">Email inválido</small>
              </div>

              <div class="input__group span-2" [class.formError]="form.get('senha')?.invalid && form.get('senha')?.touched">
                <label class="field">
                  <input type="password" formControlName="senha" [placeholder]="isEdit() ? 'Senha (deixe vazio para manter)' : 'Senha de Acesso'">
                </label>
                <span class="input__icon"><i class="bx bx-lock"></i></span>
                <small class="input__error_message">Senha deve ter no mínimo 6 caracteres</small>
              </div>

              <div class="input__group span-2" [class.formError]="form.get('descricao')?.invalid && form.get('descricao')?.touched">
                <label class="field">
                  <input type="text" formControlName="descricao" placeholder="Breve descrição da empresa ou ramo de atuação">
                </label>
                <span class="input__icon"><i class="bx bx-detail"></i></span>
              </div>
            </div>

            <div class="form-actions-row">
              <a routerLink="/login" class="back-link"><i class="bx bx-arrow-back"></i> Voltar</a>
              <button type="submit" class="submit-button btn-empresa" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Salvando...' : 'Salvar Empresa' }}
              </button>
            </div>
          </form> 
        </div>

        <div class="aside__area">
          <div class="login__aside-info">
            <h4>Seja Parceiro!</h4>
            <img src="https://d.top4top.io/p_1945xjz2y1.png" alt="Company">
            <p>Cadastre sua empresa, ofereça vantagens aos alunos de destaque e atraia talentos para o seu negócio.</p>
          </div>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    @import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

    .host-wrapper {
      min-height: 100vh; background-color: var(--bg-main);
      display: flex; justify-content: center; align-items: center; padding: 20px;
    }

    .wrapper__area {
      width: 100%; max-width: 950px;
      background-color: var(--bg-card); box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      border-radius: 12px; display: flex; flex-direction: row;
      overflow: hidden; min-height: 550px;
    }

    .forms__area { flex: 1.5; display: grid; place-items: center; padding: 40px; }
    
    .login__form { width: 100%; }

    .form__title {
      font-size: 1.8rem; font-weight: bold; text-transform: uppercase;
      margin-bottom: 25px; color: var(--text-dark); text-align: center;
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
    .span-2 { grid-column: span 2; }

    .input__group { position: relative; width: 100%; margin: 10px 0; }
    .input__group .field { position: relative; width: 100%; display: block; overflow: hidden; }

    .input__group .field::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; width: 100%; height: 2px;
      background-color: var(--secondary); transform: translateX(-100%); transition: 0.3s;
    }
    .input__group .field:focus-within::after { transform: translateX(0); }

    .input__group input {
      outline: none; width: 100%; border: none; padding: 12px 10px 12px 40px; background: transparent;
      border-bottom: 2px solid var(--input-border); font-size: 14px; color: var(--text-dark);
    }
    
    .formError .field input { border-color: var(--error); }
    .input__group > span { position: absolute; font-size: 20px; color: var(--input-border); transition: 0.3s; }
    .input__group input:focus ~ span { color: var(--secondary); }
    .input__group .input__icon { top: 10px; left: 10px; pointer-events: none; }

    .input__error_message {
      display: block; color: var(--error); margin: 4px 10px 0;
      opacity: 0; pointer-events: none; font-size: 11px;
    }
    .formError .input__error_message { opacity: 1; }

    /* Ações */
    .form-actions-row { display: flex; justify-content: space-between; align-items: center; margin-top: 25px; }
    
    .back-link {
      color: var(--input-border); font-size: 15px; text-decoration: none; display: flex; align-items: center; gap: 5px; transition: 0.3s;
    }
    .back-link:hover { color: var(--secondary); }

    .submit-button {
      color: var(--text-light); cursor: pointer; padding: 12px 30px; border: none; border-radius: 6px;
      font-size: 15px; font-weight: 600; text-transform: uppercase; transition: 0.3s;
    }
    .submit-button:disabled { background-color: #ccc; cursor: not-allowed; }

    .alert {
      width: 100%; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;
      font-size: 0.95rem; font-weight: 600; box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    }
    .alert.success { background-color: #1f7a4d; color: #fff; }
    .alert.error { background-color: #c63d2f; color: #fff; }
    
    .btn-empresa { background-color: var(--secondary); }
    .btn-empresa:hover:not(:disabled) { background-color: var(--secondary-hover); transform: translateY(-2px); }

    /* Aside Area - Tema Secundário (Empresa) */
    .aside__area {
      flex: 1; background-color: var(--secondary);
      display: grid; place-items: center; padding: 40px 20px;
    }
    .aside__area > div { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .aside__area h4 { color: var(--text-light); letter-spacing: 1px; font-size: 24px; margin-bottom: 20px; }
    .aside__area img { width: 80%; max-width: 200px; margin-bottom: 20px; }
    .aside__area p { color: var(--text-light); font-size: 14px; line-height: 1.5; }

    @media (max-width: 768px) {
      .wrapper__area { flex-direction: column; max-width: 450px; }
      .aside__area { order: -1; padding: 30px 20px; }
      .aside__area img { display: none; }
      .form-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
      .forms__area { padding: 30px 20px; }
      .form-actions-row { flex-direction: column-reverse; gap: 20px; }
      .submit-button { width: 100%; }
    }
  `]
})
export class EmpresaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  saving = signal(false);
  empresaId = signal<number | null>(null);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error' | null>(null);
  isEdit = () => this.empresaId() !== null;

  form = this.fb.nonNullable.group({
    nomeFantasia: ['', Validators.required],
    cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
    email: ['', [Validators.required, Validators.email]],
    senha: [''],
    descricao: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const routePath = this.route.snapshot.routeConfig?.path;

    if (id) {
      this.empresaId.set(Number(id));
    } else if (routePath === 'empresas/editar') {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.tipoUsuario?.toUpperCase() === 'EMPRESA') {
        this.empresaId.set(currentUser.id);
      }
    }

    const empresaIdForLoad = this.empresaId();
    if (empresaIdForLoad !== null) {
      this.empresaService.buscar(empresaIdForLoad).subscribe({
        next: (e) => {
          this.form.patchValue({
            nomeFantasia: e.nomeFantasia,
            cnpj: e.cnpj,
            email: e.email,
            descricao: e.descricao ?? '',
            senha: '',
          });
        },
        error: () => this.snack.open('Empresa não encontrada.', 'Fechar', { duration: 4000 }),
      });
    } else {
      this.form.controls.senha.addValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.message.set(null);
    this.messageType.set(null);
    this.saving.set(true);
    const dto = this.form.getRawValue() as EmpresaRequest;
    const empresaId = this.empresaId();
    const obs = empresaId !== null
      ? this.empresaService.atualizar(empresaId, dto)
      : this.empresaService.cadastrar(dto);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        const successText = this.isEdit() ? 'Dados atualizados com sucesso.' : 'Empresa cadastrada com sucesso. Faça login para continuar.';
        this.message.set(successText);
        this.messageType.set('success');

        if (this.isEdit()) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.mensagem ?? 'Erro ao salvar empresa.';
        this.message.set(msg);
        this.messageType.set('error');
      },
    });
  }
}