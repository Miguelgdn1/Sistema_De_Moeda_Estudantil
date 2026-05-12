import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlunoRequest, AlunoResponse } from '../models/api-models';

const API_BASE = 'http://localhost:8080/api/alunos';

@Injectable({ providedIn: 'root' })
export class AlunoService {
  private http = inject(HttpClient);

  listar(): Observable<AlunoResponse[]> {
    return this.http.get<AlunoResponse[]>(API_BASE);
  }

  buscar(id: number): Observable<AlunoResponse> {
    return this.http.get<AlunoResponse>(`${API_BASE}/${id}`);
  }

  cadastrar(dto: AlunoRequest): Observable<AlunoResponse> {
    return this.http.post<AlunoResponse>(API_BASE, dto);
  }

  atualizar(id: number, dto: AlunoRequest): Observable<AlunoResponse> {
    return this.http.put<AlunoResponse>(`${API_BASE}/${id}`, dto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/${id}`);
  }
}
