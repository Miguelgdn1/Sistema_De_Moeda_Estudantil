export interface ResgateResultado {
  transacaoId: number;
  codigoCupom: string;
  qrCodeBase64: string;
  dataResgate: string;
  dataExpiracao: string;
  saldoRestante: number;
  vantagemId: number;
  vantagemNome: string;
  custoMoedas: number;
  empresaNome: string | null;
}

export type CupomStatus = 'VALIDO' | 'EXPIRADO' | 'UTILIZADO';

export interface CupomValidacao {
  codigoCupom: string;
  status: CupomStatus;
  alunoNome: string | null;
  vantagemNome: string | null;
  empresaNome: string | null;
  dataResgate: string;
  dataExpiracao: string;
  cupomUsadoEm: string | null;
}
