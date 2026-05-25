export interface AlunoItem {
  id: number;
  email: string;
  cpf: string;
  rg: string;
  nome: string;
  endereco?: string;
  curso: string;
  saldoMoedas: number;
  instituicaoId: number;
  instituicaoNome: string;
}

export interface AlunoPayload {
  email: string;
  senha: string;
  cpf: string;
  rg: string;
  nome: string;
  endereco?: string;
  curso: string;
  instituicaoId: number;
}

export interface AlunoProfileUpdatePayload {
  nome: string;
  email: string;
  endereco?: string;
  senha?: string;
}
