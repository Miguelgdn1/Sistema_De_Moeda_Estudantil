import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { VantagemItem, VantagemPayload } from '../models/vantagem.model';

interface VantagemApiResponse {
  id: number;
  nome: string;
  descricao?: string;
  custoMoedas: number;
  fotoUrl?: string;
  empresaId: number | null;
  empresaNomeFantasia: string | null;
}

@Injectable({ providedIn: 'root' })
export class VantagemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/vantagens`;

  listarCatalogo(): Observable<VantagemItem[]> {
    return this.http.get<VantagemApiResponse[]>(this.apiUrl).pipe(
      map((list) => list.map((v) => this.toItem(v)))
    );
  }

  listarPorEmpresa(empresaId: number): Observable<VantagemItem[]> {
    return this.http.get<VantagemApiResponse[]>(`${this.apiUrl}/empresa/${empresaId}`).pipe(
      map((list) => list.map((v) => this.toItem(v)))
    );
  }

  buscar(id: number): Observable<VantagemItem> {
    return this.http.get<VantagemApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((v) => this.toItem(v))
    );
  }

  cadastrar(payload: VantagemPayload): Observable<VantagemItem> {
    return this.http.post<VantagemApiResponse>(this.apiUrl, payload).pipe(
      map((v) => this.toItem(v))
    );
  }

  atualizar(id: number, payload: VantagemPayload): Observable<VantagemItem> {
    return this.http.put<VantagemApiResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      map((v) => this.toItem(v))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toItem(v: VantagemApiResponse): VantagemItem {
    return {
      id: v.id,
      nome: v.nome,
      descricao: v.descricao,
      custoMoedas: v.custoMoedas,
      fotoUrl: v.fotoUrl,
      empresaId: v.empresaId,
      empresaNomeFantasia: v.empresaNomeFantasia,
    };
  }
}
