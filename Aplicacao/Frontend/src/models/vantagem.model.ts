export interface VantagemItem {
  id: number;
  nome: string;
  descricao?: string;
  custoMoedas: number;
  fotoUrl?: string;
  empresaId: number | null;
  empresaNomeFantasia: string | null;
}

export interface VantagemPayload {
  nome: string;
  descricao?: string;
  custoMoedas: number;
  fotoUrl?: string;
}
