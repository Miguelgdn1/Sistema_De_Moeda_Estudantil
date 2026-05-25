import { UserRole } from './user-role.model';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResult {
  token: string;
  tipoUsuario: UserRole;
  usuarioId: number;
  nome: string;
}
