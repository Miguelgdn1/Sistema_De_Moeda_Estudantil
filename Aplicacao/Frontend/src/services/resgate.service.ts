import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { CupomValidacao, ResgateResultado } from '../models/resgate.model';
import { TransacaoItem } from '../models/transacao.model';

interface ResgateApiResponse {
  transacaoId: number;
  codigoCupom: string;
  qrCodeBase64: string;
  dataResgate: string;
  dataExpiracao: string;
  saldoRestante: number;
  vantagemId: number;
  vantagemNome: string;
  custoMoedas: number;
  empresaNome: string | null;
}

interface CupomApiResponse {
  codigoCupom: string;
  status: 'VALIDO' | 'EXPIRADO' | 'UTILIZADO';
  alunoNome: string | null;
  vantagemNome: string | null;
  empresaNome: string | null;
  dataResgate: string;
  dataExpiracao: string;
  cupomUsadoEm: string | null;
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
export class ResgateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/resgates`;
  private readonly cuponsUrl = `${environment.apiUrl}/cupons`;

  resgatar(vantagemId: number): Observable<ResgateResultado> {
    return this.http.post<ResgateApiResponse>(this.apiUrl, { vantagemId });
  }

  meusCupons(): Observable<TransacaoItem[]> {
    return this.http.get<TransacaoApiResponse[]>(`${this.apiUrl}/meus`).pipe(
      map((list) => list.map((t) => ({
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
      })))
    );
  }

  validar(codigo: string): Observable<CupomValidacao> {
    return this.http.get<CupomApiResponse>(`${this.cuponsUrl}/${codigo}/validar`);
  }

  utilizar(codigo: string): Observable<CupomValidacao> {
    return this.http.post<CupomApiResponse>(`${this.cuponsUrl}/${codigo}/utilizar`, {});
  }
}
