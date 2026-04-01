import { ApiPerfil } from './api-perfil.model';

export interface ApiUsuarioResponse {
  id: number;
  username: string;
  perfil: ApiPerfil | null;
  email: string;
}
