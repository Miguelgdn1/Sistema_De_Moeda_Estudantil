export interface Instituicao {
  id: number;
  nome: string;
  cnpj?: string;
  endereco?: string;
}

export interface AlunoRequest {
  email: string;
  senha: string;
  cpf: string;
  rg: string;
  nome: string;
  endereco?: string;
  curso: string;
  instituicaoId: number;
}

export interface AlunoResponse {
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

export interface EmpresaRequest {
  email: string;
  senha: string;
  cnpj: string;
  nomeFantasia: string;
  descricao?: string;
}

export interface EmpresaResponse {
  id: number;
  email: string;
  cnpj: string;
  nomeFantasia: string;
  descricao?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipoUsuario: 'ALUNO' | 'PROFESSOR' | 'EMPRESA' | string;
  usuarioId: number;
  nome: string;
}

export interface TransacaoResponse {
  id: number;
  dataHora: string | Date;
  descricao: string;
  tipo: 'CREDITO' | 'DEBITO';
  valor: number;
  alunoId?: number | null;
  alunoNome?: string | null;
}

export type TransactionType = 'CREDITO' | 'DEBITO';

export interface Transaction {
  id: number;
  dataHora: string | Date;
  descricao: string;
  tipo: TransactionType;
  valor: number;
  alunoId?: number | null;
  alunoNome?: string | null;
}

export type Student = AlunoResponse;


