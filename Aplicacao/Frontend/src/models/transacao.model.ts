export type TipoTransacao = 'ENVIO_MOEDA' | 'RESGATE_VANTAGEM';

export interface TransacaoItem {
  id: number;
  tipo: TipoTransacao;
  valor: number;
  dataHora: string;
  descricao: string;
  alunoId: number | null;
  alunoNome: string | null;
}

export interface ExtratoItem {
  saldoAtual: number;
  transacoes: TransacaoItem[];
}
