import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <div class="host-wrapper">
      <div class="wrapper__area" [class.sign-up__Mode-active]="isSignUpMode">
        
        <div class="forms__area">
          
          <form class="login__form" [formGroup]="form" (ngSubmit)="onSubmit()">
            <h1 class="form__title">Acessar!</h1>
            
            <div class="input__group" [class.formError]="form.get('email')?.invalid && form.get('email')?.touched">
              <label class="field">
                <input type="email" formControlName="email" placeholder="Email / CPF" autocomplete="email">
              </label>
              <span class="input__icon"><i class="bx bx-user"></i></span>
              <small class="input__error_message">Email ou CPF inválido</small>
            </div>

            <div class="input__group" [class.formError]="form.get('senha')?.invalid && form.get('senha')?.touched">
              <label class="field">
                <input [type]="showPassword ? 'text' : 'password'" formControlName="senha" placeholder="Senha" autocomplete="current-password">
              </label>
              <span class="input__icon"><i class="bx bx-lock"></i></span>
              <span class="showHide__Icon" (click)="togglePassword()">
                <i class="bx" [class.bx-show]="showPassword" [class.bx-hide]="!showPassword"></i>
              </span>
              <small class="input__error_message">A senha é obrigatória</small>
            </div>

            <div class="form__actions">
              <label for="checkboxInput" class="remeber_me">
                <input type="checkbox" id="checkboxInput">
                <span class="checkmark"></span>
                <span>Lembrar-me</span>
              </label>
              <div class="forgot_password">Esqueceu a senha?</div>
            </div>

            <button type="submit" class="submit-button" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Entrando...' : 'Entrar no Sistema' }}
            </button>
          </form> 
          <div class="custom-signup-panel">
            <h1 class="form__title">Cadastre-se!</h1>
            <p class="signup-subtitle">Escolha o seu perfil para criar uma conta na plataforma:</p>
            
            <button routerLink="/alunos/novo" class="submit-button">👨‍🎓 Sou Aluno</button>
            
            <button routerLink="/empresas/novo" class="submit-button btn-empresa">🏢 Sou Empresa Parceira</button>
          </div> 
          </div><div class="aside__area">
          <div class="login__aside-info">
            <h4>Olá!</h4>
            <img src="https://d.top4top.io/p_1945xjz2y1.png" alt="Image">
            <p>Ainda não faz parte do Student Coins? Escolha seu perfil e cadastre-se!</p>
            <button type="button" class="btn-outline" (click)="toggleMode()">Criar Conta</button>
          </div>
          <div class="sign-up__aside-info">
            <h4>Bem-vindo!</h4>
            <img src="https://e.top4top.io/p_1945sidbp2.png" alt="Image">
            <p>Para se conectar conosco, faça login com suas credenciais.</p>
            <button type="button" class="btn-outline" (click)="toggleMode()">Fazer Login</button>
          </div>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    @import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

    .host-wrapper {
      min-height: 100vh;
      background-color: var(--bg-main);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .wrapper__area {
      width: 100%;
      max-width: 900px;
      background-color: var(--bg-card);
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      border-radius: 12px;
      display: flex;
      flex-direction: row;
      overflow: hidden;
      min-height: 550px;
    }

    .forms__area {
      flex: 1;
      display: grid;
      place-items: center;
      padding: 40px;
    }

    .forms__area > form, 
    .forms__area > .custom-signup-panel {
      grid-area: 1 / 1;
      width: 100%;
      transition: 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .custom-signup-panel { text-align: center; }

    .signup-subtitle { color: #666; margin-bottom: 30px; font-size: 15px; }

    .form__title {
      font-size: 2.2rem; font-weight: bold; text-transform: uppercase;
      margin-bottom: 30px; color: var(--text-dark);
    }

    .input__group { position: relative; width: 100%; margin: 15px 0; }
    .input__group .field { position: relative; width: 100%; display: block; overflow: hidden; }

    .input__group .field::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; width: 100%; height: 2px;
      background-color: var(--primary);
      transform: translateX(-100%); transition: 0.3s;
    }

    .input__group .field:focus-within::after { transform: translateX(0); }

    .input__group input {
      outline: none; width: 100%; border: none; padding: 15px 40px; background: transparent;
      border-bottom: 2px solid var(--input-border); font-size: 15px; color: var(--text-dark);
    }

    .formError .field input { border-color: var(--error); }
    .input__group > span { position: absolute; font-size: 20px; color: var(--input-border); transition: 0.3s; }
    .input__group input:focus ~ span { color: var(--primary); }
    .input__group .input__icon { top: 13px; left: 10px; pointer-events: none; }
    .input__group .showHide__Icon { top: 13px; right: 10px; cursor: pointer; }

    .input__error_message {
      display: block; color: var(--error); margin: 4px 10px 0;
      opacity: 0; pointer-events: none; font-size: 12px;
    }
    .formError .input__error_message { opacity: 1; }

    .form__actions { display: flex; justify-content: space-between; align-items: center; margin: 10px 0 25px; padding: 0 10px; }
    .remeber_me { cursor: pointer; font-size: 14px; color: #666; display: flex; align-items: center; gap: 8px; }
    .remeber_me input { width: 15px; height: 15px; cursor: pointer; }
    .forgot_password { cursor: pointer; font-size: 14px; color: var(--primary); font-weight: 600; }

    /* Submit Buttons Padronizados */
    .submit-button {
      width: 100%; max-width: 300px;
      background-color: var(--primary);
      color: var(--text-light);
      cursor: pointer; padding: 15px 0; border: none; border-radius: 6px;
      font-size: 16px; font-weight: 600; letter-spacing: 1px;
      margin: 15px auto; display: block; transition: 0.3s; text-transform: uppercase;
    }
    .submit-button:disabled { background-color: #ccc; cursor: not-allowed; }
    .submit-button:hover:not(:disabled) { background-color: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
    
    .btn-empresa { background-color: var(--secondary); }
    .btn-empresa:hover:not(:disabled) { background-color: var(--secondary-hover); }

    /* Aside Area (Painel Azul) */
    .aside__area {
      width: 340px; background-color: var(--primary);
      display: grid; place-items: center; padding: 40px 20px;
    }

    .aside__area > div {
      grid-area: 1 / 1; width: 100%; text-align: center;
      transition: 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      display: flex; flex-direction: column; align-items: center;
    }

    .aside__area h4 { color: var(--text-light); letter-spacing: 2px; font-size: 28px; margin-bottom: 15px; }
    .aside__area img { width: 80%; max-width: 200px; pointer-events: none; margin-bottom: 15px; }
    .aside__area p { color: var(--text-light); font-size: 14px; margin-bottom: 25px; line-height: 1.5; }

    .btn-outline {
      background-color: transparent; width: 80%;
      border: 2px solid var(--text-light); color: var(--text-light);
      cursor: pointer; padding: 12px 0; border-radius: 6px;
      font-size: 15px; font-weight: 600; letter-spacing: 1px; transition: 0.3s;
    }
    .btn-outline:hover { background-color: var(--text-light); color: var(--primary); }

    /* Logica de Animação */
    .login__form, .login__aside-info { opacity: 1; pointer-events: all; transform: translateX(0); visibility: visible; }
    .custom-signup-panel, .sign-up__aside-info { opacity: 0; pointer-events: none; transform: translateX(50px); visibility: hidden; }

    .wrapper__area.sign-up__Mode-active .login__form { opacity: 0; pointer-events: none; transform: translateX(-50px); visibility: hidden; }
    .wrapper__area.sign-up__Mode-active .custom-signup-panel { opacity: 1; pointer-events: all; transform: translateX(0); visibility: visible; }

    .wrapper__area.sign-up__Mode-active .login__aside-info { opacity: 0; pointer-events: none; transform: translateX(-50px); visibility: hidden; }
    .wrapper__area.sign-up__Mode-active .sign-up__aside-info { opacity: 1; pointer-events: all; transform: translateX(0); visibility: visible; }

    /* Responsivo */
    @media (max-width: 768px) {
      .wrapper__area { flex-direction: column; max-width: 450px; min-height: auto; }
      .aside__area { width: 100%; order: -1; padding: 30px 20px; }
      .aside__area img { display: none; }
      .aside__area h4 { font-size: 24px; margin-bottom: 5px; }
      .aside__area p { margin-bottom: 15px; }
      .forms__area { padding: 30px 20px; }
      .form__title { font-size: 1.8rem; margin-bottom: 20px; }
      .submit-button, .btn-outline { width: 100%; max-width: 100%; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  // Variáveis para controle da animação UI
  isSignUpMode = false;
  showPassword = false;

  loading = signal(false);
  
  // O seu formulário original não mudou nada!
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  // Alterna o deslize da tela (acionado pelos botões de Criar Conta / Fazer Login)
  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;
  }

  // Alterna o olhinho da senha
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // O processo de submissão ao backend continua 100% o mesmo
onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Faz as bordas ficarem vermelhas se submeter vazio
      return;
    }
    
    this.loading.set(true);
    
    this.auth.login(this.form.getRawValue()).subscribe({
      // Adicionamos o "res: any" para capturar os dados que o seu backend devolve
      next: (res: any) => {
        this.loading.set(false);
        
        // SEGURANÇA EXTRA: Se o seu backend devolve na resposta se é aluno ou empresa, salve aqui!
        // Se o backend enviar algo como { token: "...", tipo: "EMPRESA" }:
        if (res && res.tipo) {
           localStorage.setItem('userRole', res.tipo);
        }

        // REDIRECIONA PARA A HOME!
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.mensagem ?? 'Falha ao autenticar.';
        this.snack.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }
}