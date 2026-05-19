import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard'; // Importante adicionar o adminGuard
import { IntroComponent } from './core/intro/intro.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  { path: '', component: IntroComponent },
  { path: 'home', component: HomeComponent },
  
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  
  // ================= ROTAS DE ALUNO =================
  {
    path: 'alunos/extrato',
    canActivate: [authGuard],
    loadComponent: () => import('./features/alunos/extrato/aluno-extrato.component').then((m) => m.AlunoExtratoComponent),
  },
  {
    path: 'alunos/painel',
    canActivate: [authGuard],
    loadComponent: () => import('./features/alunos/aluno-dashboard.component').then((m) => m.AlunoDashboardComponent),
  },
  {
    path: 'alunos/editar-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/alunos/profile-edit.component').then((m) => m.ProfileEditComponent),
  },
  {
    path: 'alunos/novo',
    loadComponent: () => import('./features/alunos/aluno-form.component').then((m) => m.AlunoFormComponent),
  },
  {
    path: 'alunos/:id/editar',
    canActivate: [authGuard, adminGuard], // 🛡️ Protegido: Apenas ADMIN pode editar
    loadComponent: () => import('./features/alunos/aluno-form.component').then((m) => m.AlunoFormComponent),
  },
  {
    path: 'alunos',
    canActivate: [authGuard, adminGuard], // 🛡️ Protegido: Apenas ADMIN pode ver a lista
    loadComponent: () => import('./features/alunos/aluno-list.component').then((m) => m.AlunoListComponent),
  },

  // ================= ROTAS DE EMPRESA =================
  {
    path: 'empresas/novo',
    loadComponent: () => import('./features/empresas/empresa-form.component').then((m) => m.EmpresaFormComponent),
  },
  {
    path: 'empresas/editar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/empresas/empresa-form.component').then((m) => m.EmpresaFormComponent),
  },
  {
    path: 'empresas/relatorio',
    canActivate: [authGuard],
    loadComponent: () => import('./features/empresas/empresa-relatorio.component').then((m) => m.EmpresaRelatorioComponent),
  },
  {
    path: 'empresas/:id/editar',
    canActivate: [authGuard, adminGuard], // 🛡️ Protegido: Apenas ADMIN pode editar
    loadComponent: () => import('./features/empresas/empresa-form.component').then((m) => m.EmpresaFormComponent),
  },
  {
    path: 'empresas',
    canActivate: [authGuard, adminGuard], // 🛡️ Protegido: Apenas ADMIN pode ver a lista
    loadComponent: () => import('./features/empresas/empresa-list.component').then((m) => m.EmpresaListComponent),
  },


  // ================= ROTAS DE VANTAGENS =================
  {
    path: 'vantagens/nova',
    canActivate: [authGuard], // Apenas logados podem acessar
    loadComponent: () => import('./features/empresas/vantagem-form.component').then((m) => m.VantagemFormComponent),
  },

  // A ROTA CORINGA (**) DEVE SEMPRE SER A ÚLTIMA!
  { path: '**', redirectTo: 'login' }
];