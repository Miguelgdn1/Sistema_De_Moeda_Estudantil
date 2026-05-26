import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';
import { adminGuard } from '../guards/admin.guard';
import { professorGuard } from '../guards/professor.guard';
import { IntroPage } from '../pages/intro/intro-page';
import { HomePage } from '../pages/home/home-page';

export const routes: Routes = [
  { path: '', component: IntroPage },
  { path: 'home', component: HomePage },
  {
    path: 'login',
    loadComponent: () => import('../pages/auth/login-page').then((m) => m.LoginPage),
  },

  // ================= ROTAS DE ALUNO =================
  {
    path: 'alunos/novo',
    loadComponent: () => import('../pages/alunos/aluno-form-page').then((m) => m.AlunoFormPage),
  },
  {
    path: 'alunos/extrato',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/alunos/extrato/aluno-extrato-page').then((m) => m.AlunoExtratoPage),
  },
  {
    path: 'alunos/painel',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/alunos/aluno-dashboard-page').then((m) => m.AlunoDashboardPage),
  },
  {
    path: 'alunos/editar-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/alunos/profile-edit-page').then((m) => m.ProfileEditPage),
  },
  {
    path: 'alunos/vantagens',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/alunos/aluno-vantagens-page').then((m) => m.AlunoVantagensPage),
  },
  {
    path: 'alunos/cupons',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/alunos/aluno-cupons-page').then((m) => m.AlunoCuponsPage),
  },
  {
    path: 'alunos/:id/editar',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('../pages/alunos/aluno-form-page').then((m) => m.AlunoFormPage),
  },
  {
    path: 'alunos',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('../pages/alunos/aluno-list-page').then((m) => m.AlunoListPage),
  },

  // ================= ROTAS DE EMPRESA =================
  {
    path: 'empresas/novo',
    loadComponent: () => import('../pages/empresas/empresa-form-page').then((m) => m.EmpresaFormPage),
  },
  {
    path: 'empresas/editar',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/empresas/empresa-form-page').then((m) => m.EmpresaFormPage),
  },
  {
    path: 'empresas/vantagens',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/empresas/empresa-vantagens-page').then((m) => m.EmpresaVantagensPage),
  },
  {
    path: 'empresas/vantagens/nova',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/empresas/vantagem-form-page').then((m) => m.VantagemFormPage),
  },
  {
    path: 'empresas/vantagens/:id/editar',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/empresas/vantagem-form-page').then((m) => m.VantagemFormPage),
  },
  {
    path: 'empresas/relatorio',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/empresas/empresa-relatorio-page').then((m) => m.EmpresaRelatorioPage),
  },
  {
    path: 'empresas/:id/editar',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('../pages/empresas/empresa-form-page').then((m) => m.EmpresaFormPage),
  },
  {
    path: 'empresas',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('../pages/empresas/empresa-list-page').then((m) => m.EmpresaListPage),
  },

  // ================= ROTAS DE PROFESSOR =================
  {
    path: 'professor/painel',
    canActivate: [authGuard, professorGuard],
    loadComponent: () => import('../pages/professor/professor-dashboard-page').then((m) => m.ProfessorDashboardPage),
  },
  {
    path: 'professor/distribuir',
    canActivate: [authGuard, professorGuard],
    loadComponent: () => import('../pages/professor/distribuir-moedas-page').then((m) => m.DistribuirMoedasPage),
  },
  {
    path: 'professor/extrato',
    canActivate: [authGuard, professorGuard],
    loadComponent: () => import('../pages/professor/professor-extrato-page').then((m) => m.ProfessorExtratoPage),
  },

  // CRUD admin de professores
  {
    path: 'professores/novo',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('../pages/professor/professor-form-page').then((m) => m.ProfessorFormPage),
  },
  {
    path: 'professores/:id/editar',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('../pages/professor/professor-form-page').then((m) => m.ProfessorFormPage),
  },
  {
    path: 'professores',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('../pages/professor/professor-list-page').then((m) => m.ProfessorListPage),
  },

  { path: '**', redirectTo: 'login' },
];
