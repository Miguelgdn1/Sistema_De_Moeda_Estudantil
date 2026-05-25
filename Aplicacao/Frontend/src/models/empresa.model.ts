export interface EmpresaItem {
  id: number;
  email: string;
  cnpj: string;
  nomeFantasia: string;
  descricao?: string;
}

export interface EmpresaPayload {
  email: string;
  senha: string;
  cnpj: string;
  nomeFantasia: string;
  descricao?: string;
}

export type EmpresaUpdatePayload = EmpresaPayload;
