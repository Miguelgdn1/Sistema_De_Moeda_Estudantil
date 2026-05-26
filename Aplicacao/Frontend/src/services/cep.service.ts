import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { EnderecoEstruturado, ViaCepResponse } from '../models/endereco.model';

@Injectable({ providedIn: 'root' })
export class CepService {
  private readonly http = inject(HttpClient);

  buscar(cep: string): Observable<EnderecoEstruturado | null> {
    const numeros = (cep ?? '').replace(/\D/g, '');
    if (numeros.length !== 8) {
      return of(null);
    }
    return this.http
      .get<ViaCepResponse>(`https://viacep.com.br/ws/${numeros}/json/`)
      .pipe(
        map((resp) => {
          if (!resp || resp.erro) {
            return null;
          }
          return {
            cep: numeros,
            logradouro: resp.logradouro || '',
            complemento: resp.complemento || '',
            bairro: resp.bairro || '',
            cidade: resp.localidade || '',
            uf: resp.uf || '',
          } as EnderecoEstruturado;
        }),
        catchError(() => of(null))
      );
  }
}
