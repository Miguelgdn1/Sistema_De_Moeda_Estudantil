import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { DistribuirMoedasPayload, ProfessorItem, ProfessorPayload } from '../models/professor.model';
import { ExtratoItem, TransacaoItem } from '../models/transacao.model';

interface ProfessorApiResponse {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  departamento: string;
  instituicaoId: number;
  instituicaoNome: string;
  saldoMoedas: number;
}

interface TransacaoApiResponse {
  id: number;
  tipo: 'ENVIO_MOEDA' | 'RESGATE_VANTAGEM';
  valor: number;
  dataHora: string;
  descricao: string;
  alunoId: number | null;
  alunoNome: string | null;
}

interface ExtratoApiResponse {
  saldoAtual: number;
  transacoes: TransacaoApiResponse[];
}

@Injectable({ providedIn: 'root' })
export class ProfessorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/professores`;

  getMe(): Observable<ProfessorItem> {
    return this.http.get<ProfessorApiResponse>(`${this.apiUrl}/me`).pipe(
      map((p) => this.toItem(p))
    );
  }

  listar(): Observable<ProfessorItem[]> {
    return this.http.get<ProfessorApiResponse[]>(this.apiUrl).pipe(
      map((list) => list.map((p) => this.toItem(p)))
    );
  }

  getById(id: number): Observable<ProfessorItem> {
    return this.http.get<ProfessorApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((p) => this.toItem(p))
    );
  }

  cadastrar(payload: ProfessorPayload): Observable<ProfessorItem> {
    return this.http.post<ProfessorApiResponse>(this.apiUrl, payload).pipe(
      map((p) => this.toItem(p))
    );
  }

  atualizar(id: number, payload: ProfessorPayload): Observable<ProfessorItem> {
    return this.http.put<ProfessorApiResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      map((p) => this.toItem(p))
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ajustarSaldo(id: number, quantidade: number): Observable<ProfessorItem> {
    return this.http.post<ProfessorApiResponse>(`${this.apiUrl}/${id}/saldo`, { quantidade }).pipe(
      map((p) => this.toItem(p))
    );
  }

  getExtrato(id: number): Observable<ExtratoItem> {
    return this.http.get<ExtratoApiResponse>(`${this.apiUrl}/${id}/extrato`).pipe(
      map((e) => this.toExtrato(e))
    );
  }

  distribuir(id: number, payload: DistribuirMoedasPayload): Observable<TransacaoItem> {
    return this.http.post<TransacaoApiResponse>(`${this.apiUrl}/${id}/distribuir`, payload).pipe(
      map((t) => this.toTransacao(t))
    );
  }

  private toItem(p: ProfessorApiResponse): ProfessorItem {
    return {
      id: p.id,
      nome: p.nome,
      email: p.email,
      cpf: p.cpf,
      departamento: p.departamento,
      instituicaoId: p.instituicaoId,
      instituicaoNome: p.instituicaoNome,
      saldoMoedas: p.saldoMoedas,
    };
  }

  private toTransacao(t: TransacaoApiResponse): TransacaoItem {
    return {
      id: t.id,
      tipo: t.tipo,
      valor: t.valor,
      dataHora: t.dataHora,
      descricao: t.descricao,
      alunoId: t.alunoId,
      alunoNome: t.alunoNome,
    };
  }

  private toExtrato(e: ExtratoApiResponse): ExtratoItem {
    return {
      saldoAtual: e.saldoAtual,
      transacoes: e.transacoes.map((t) => this.toTransacao(t)),
    };
  }
}
