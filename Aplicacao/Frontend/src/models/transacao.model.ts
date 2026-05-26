export type TipoTransacao = 'ENVIO_MOEDA' | 'RESGATE_VANTAGEM';

export interface TransacaoItem {
  id: number;
  tipo: TipoTransacao;
  valor: number;
  dataHora: string;
  descricao: string;
  alunoId: number | null;
  alunoNome: string | null;
  codigoCupom?: string | null;
  dataExpiracao?: string | null;
  cupomUsadoEm?: string | null;
  vantagemId?: number | null;
  vantagemNome?: string | null;
  empresaNomeFantasia?: string | null;
}

export interface ExtratoItem {
  saldoAtual: number;
  transacoes: TransacaoItem[];
}
