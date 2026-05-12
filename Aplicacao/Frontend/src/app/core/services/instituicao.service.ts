import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Instituicao } from '../models/api-models';

const API_BASE = 'http://localhost:8080/api/instituicoes';

@Injectable({ providedIn: 'root' })
export class InstituicaoService {
  private http = inject(HttpClient);

  listar(): Observable<Instituicao[]> {
    return this.http.get<Instituicao[]>(API_BASE);
  }
}
