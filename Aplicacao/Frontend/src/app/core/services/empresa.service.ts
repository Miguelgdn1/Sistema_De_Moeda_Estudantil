import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpresaRequest, EmpresaResponse } from '../models/api-models';

const API_BASE = 'http://localhost:8080/api/empresas';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private http = inject(HttpClient);

  listar(): Observable<EmpresaResponse[]> {
    return this.http.get<EmpresaResponse[]>(API_BASE);
  }

  buscar(id: number): Observable<EmpresaResponse> {
    return this.http.get<EmpresaResponse>(`${API_BASE}/${id}`);
  }

  cadastrar(dto: EmpresaRequest): Observable<EmpresaResponse> {
    return this.http.post<EmpresaResponse>(API_BASE, dto);
  }

  atualizar(id: number, dto: EmpresaRequest): Observable<EmpresaResponse> {
    return this.http.put<EmpresaResponse>(`${API_BASE}/${id}`, dto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/${id}`);
  }
}
