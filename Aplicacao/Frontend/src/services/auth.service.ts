import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { CurrentUser, UserRole } from '../models/user-role.model';
import { LoginPayload, LoginResult } from '../models/auth.model';

const TOKEN_KEY = 'moedaestudantil.token';
const USER_KEY = 'moedaestudantil.user';

interface LoginApiResponse {
  token: string;
  tipoUsuario: UserRole;
  usuarioId: number;
  nome: string;
}

export interface ProfessorPublicoItem {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(credentials: LoginPayload): Observable<LoginResult> {
    return this.http.post<LoginApiResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map((res) => this.toResult(res)),
      tap((res) => this.persistir(res))
    );
  }

  loginProfessor(professorId: number, senha: string): Observable<LoginResult> {
    return this.http.post<LoginApiResponse>(`${this.apiUrl}/login-professor`, { professorId, senha }).pipe(
      map((res) => this.toResult(res)),
      tap((res) => this.persistir(res))
    );
  }

  listarProfessoresPublicos(): Observable<ProfessorPublicoItem[]> {
    return this.http.get<ProfessorPublicoItem[]>(`${this.apiUrl}/professores`);
  }

  private persistir(res: LoginResult): void {
    sessionStorage.setItem(TOKEN_KEY, res.token);
    const user: CurrentUser = {
      id: res.usuarioId,
      nome: res.nome,
      tipoUsuario: res.tipoUsuario,
    };
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  getCurrentUser(): CurrentUser | null {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  }

  updateCurrentUserName(nome: string): void {
    const user = this.getCurrentUser();
    if (!user) return;
    sessionStorage.setItem(USER_KEY, JSON.stringify({ ...user, nome }));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private toResult(r: LoginApiResponse): LoginResult {
    return {
      token: r.token,
      tipoUsuario: r.tipoUsuario,
      usuarioId: r.usuarioId,
      nome: r.nome,
    };
  }
}
