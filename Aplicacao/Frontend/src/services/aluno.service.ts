import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { AlunoItem, AlunoPayload } from '../models/aluno.model';

interface AlunoApiResponse {
  id: number;
  email: string;
  cpf: string;
  rg: string;
  nome: string;
  telefone?: string;
  endereco?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  curso: string;
  saldoMoedas: number;
  instituicaoId: number;
  instituicaoNome: string;
}

@Injectable({ providedIn: 'root' })
export class AlunoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/alunos`;

  listar(): Observable<AlunoItem[]> {
    return this.http.get<AlunoApiResponse[]>(this.apiUrl).pipe(
      map((list) => list.map((a) => this.toItem(a)))
    );
  }

  buscar(id: number): Observable<AlunoItem> {
    return this.http.get<AlunoApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((a) => this.toItem(a))
    );
  }

  cadastrar(payload: AlunoPayload): Observable<AlunoItem> {
    return this.http.post<AlunoApiResponse>(this.apiUrl, payload).pipe(
      map((a) => this.toItem(a))
    );
  }

  atualizar(id: number, payload: AlunoPayload): Observable<AlunoItem> {
    return this.http.put<AlunoApiResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      map((a) => this.toItem(a))
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ajustarSaldo(id: number, quantidade: number): Observable<AlunoItem> {
    return this.http.post<AlunoApiResponse>(`${this.apiUrl}/${id}/saldo`, { quantidade }).pipe(
      map((a) => this.toItem(a))
    );
  }

  private toItem(a: AlunoApiResponse): AlunoItem {
    return {
      id: a.id,
      email: a.email,
      cpf: a.cpf,
      rg: a.rg,
      nome: a.nome,
      telefone: a.telefone,
      endereco: a.endereco,
      cep: a.cep,
      logradouro: a.logradouro,
      numero: a.numero,
      complemento: a.complemento,
      bairro: a.bairro,
      cidade: a.cidade,
      uf: a.uf,
      curso: a.curso,
      saldoMoedas: a.saldoMoedas,
      instituicaoId: a.instituicaoId,
      instituicaoNome: a.instituicaoNome,
    };
  }
}
