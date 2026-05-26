import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { AlunoItem, AlunoProfileUpdatePayload } from '../models/aluno.model';
import { TransacaoItem } from '../models/transacao.model';

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

interface TransacaoApiResponse {
  id: number;
  tipo: 'ENVIO_MOEDA' | 'RESGATE_VANTAGEM';
  valor: number;
  dataHora: string;
  descricao: string;
  alunoId: number | null;
  alunoNome: string | null;
  codigoCupom?: string | null;
  dataExpiracao?: string | null;
  cupomUsadoEm?: string | null;
  vantagemId?: number | null;
  vantagemNome?: string | null;
  empresaNomeFantasia?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/students`;

  getStudentProfile(studentId: number): Observable<AlunoItem> {
    return this.http.get<AlunoApiResponse>(`${this.apiUrl}/${studentId}/profile`).pipe(
      map((a) => this.toItem(a))
    );
  }

  updateStudentProfile(studentId: number, data: AlunoProfileUpdatePayload): Observable<AlunoItem> {
    return this.http.put<AlunoApiResponse>(`${this.apiUrl}/${studentId}/profile`, data).pipe(
      map((a) => this.toItem(a))
    );
  }

  getStudentTransactions(studentId: number): Observable<TransacaoItem[]> {
    return this.http.get<TransacaoApiResponse[]>(`${this.apiUrl}/${studentId}/extrato`).pipe(
      map((list) => list.map((t) => this.toTransacao(t)))
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

  private toTransacao(t: TransacaoApiResponse): TransacaoItem {
    return {
      id: t.id,
      tipo: t.tipo,
      valor: t.valor,
      dataHora: t.dataHora,
      descricao: t.descricao,
      alunoId: t.alunoId,
      alunoNome: t.alunoNome,
      codigoCupom: t.codigoCupom ?? null,
      dataExpiracao: t.dataExpiracao ?? null,
      cupomUsadoEm: t.cupomUsadoEm ?? null,
      vantagemId: t.vantagemId ?? null,
      vantagemNome: t.vantagemNome ?? null,
      empresaNomeFantasia: t.empresaNomeFantasia ?? null,
    };
  }
}
