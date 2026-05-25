export interface ProfessorItem {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  departamento: string;
  instituicaoId: number;
  instituicaoNome: string;
  saldoMoedas: number;
}

export interface DistribuirMoedasPayload {
  alunoId: number;
  quantidade: number;
  mensagem: string;
}
