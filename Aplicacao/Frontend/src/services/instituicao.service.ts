import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { InstituicaoItem } from '../models/instituicao.model';

interface InstituicaoApiResponse {
  id: number;
  nome: string;
  cnpj?: string;
  endereco?: string;
}

@Injectable({ providedIn: 'root' })
export class InstituicaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/instituicoes`;

  listar(): Observable<InstituicaoItem[]> {
    return this.http.get<InstituicaoApiResponse[]>(this.apiUrl).pipe(
      map((list) => list.map((i) => this.toItem(i)))
    );
  }

  private toItem(i: InstituicaoApiResponse): InstituicaoItem {
    return { id: i.id, nome: i.nome, cnpj: i.cnpj, endereco: i.endereco };
  }
}
