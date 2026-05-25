import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { EmpresaItem, EmpresaPayload, EmpresaUpdatePayload } from '../models/empresa.model';
import { TransacaoItem } from '../models/transacao.model';

interface EmpresaApiResponse {
  id: number;
  email: string;
  cnpj: string;
  nomeFantasia: string;
  descricao?: string;
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

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/empresas`;

  listar(): Observable<EmpresaItem[]> {
    return this.http.get<EmpresaApiResponse[]>(this.apiUrl).pipe(
      map((list) => list.map((e) => this.toItem(e)))
    );
  }

  buscar(id: number): Observable<EmpresaItem> {
    return this.http.get<EmpresaApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((e) => this.toItem(e))
    );
  }

  cadastrar(payload: EmpresaPayload): Observable<EmpresaItem> {
    return this.http.post<EmpresaApiResponse>(this.apiUrl, payload).pipe(
      map((e) => this.toItem(e))
    );
  }

  atualizar(id: number, payload: EmpresaUpdatePayload): Observable<EmpresaItem> {
    return this.http.put<EmpresaApiResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      map((e) => this.toItem(e))
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  relatorioTrocas(id: number): Observable<TransacaoItem[]> {
    return this.http.get<TransacaoApiResponse[]>(`${this.apiUrl}/${id}/trocas`).pipe(
      map((list) => list.map((t) => this.toTransacao(t)))
    );
  }

  private toItem(e: EmpresaApiResponse): EmpresaItem {
    return {
      id: e.id,
      email: e.email,
      cnpj: e.cnpj,
      nomeFantasia: e.nomeFantasia,
      descricao: e.descricao,
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
}
