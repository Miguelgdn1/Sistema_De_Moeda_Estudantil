export type UserRole = 'ALUNO' | 'PROFESSOR' | 'EMPRESA' | 'ADMIN';

export interface CurrentUser {
  id: number;
  nome: string;
  tipoUsuario: UserRole;
}
