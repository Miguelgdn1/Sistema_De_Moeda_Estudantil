import { EnderecoEstruturado } from './endereco.model';

export interface AlunoItem extends EnderecoEstruturado {
  id: number;
  email: string;
  cpf: string;
  rg: string;
  nome: string;
  telefone?: string;
  endereco?: string;
  curso: string;
  saldoMoedas: number;
  instituicaoId: number;
  instituicaoNome: string;
}

export interface AlunoPayload extends EnderecoEstruturado {
  email: string;
  senha: string;
  cpf: string;
  rg: string;
  nome: string;
  telefone?: string;
  curso: string;
  instituicaoId: number;
}

export interface AlunoProfileUpdatePayload extends EnderecoEstruturado {
  nome: string;
  email: string;
  telefone?: string;
  senha?: string;
}
