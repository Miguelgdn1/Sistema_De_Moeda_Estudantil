import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'alunos/novo',
    loadComponent: () => import('./features/alunos/aluno-form.component').then((m) => m.AlunoFormComponent),
  },
  {
    path: 'alunos/:id/editar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/alunos/aluno-form.component').then((m) => m.AlunoFormComponent),
  },
  {
    path: 'alunos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/alunos/aluno-list.component').then((m) => m.AlunoListComponent),
  },
  {
    path: 'empresas/novo',
    loadComponent: () => import('./features/empresas/empresa-form.component').then((m) => m.EmpresaFormComponent),
  },
  {
    path: 'empresas/:id/editar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/empresas/empresa-form.component').then((m) => m.EmpresaFormComponent),
  },
  {
    path: 'empresas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/empresas/empresa-list.component').then((m) => m.EmpresaListComponent),
  },
  { path: '**', redirectTo: 'login' },
];
