import { ApiUsuario } from '../models/api-usuario.model';
import { ApiUsuarioResponse } from '../models/api-usuario-response.model';
import { UsuarioAdminFormModel } from '../models/usuario-admin-form.model';
import { UsuarioAdminVm } from '../models/usuario-admin-vm.model';

export function mapUsuarioFormToApiUsuario(form: UsuarioAdminFormModel): ApiUsuario {
  const nome = form.nome.trim();
  const email = form.email.trim();
  const fallbackUsername = email;
  const username = form.username.trim() || fallbackUsername;

  return {
    nome,
    email,
    username,
    senha: form.senha,
    id_perfil: form.idPerfil ?? 1
  };
}

export function mapApiUsuarioResponseToVm(usuario: ApiUsuarioResponse): UsuarioAdminVm {
  const perfilNome = usuario.perfil?.nome?.trim() || 'Sem perfil';
  const perfilId = usuario.perfil?.id ?? null;

  return {
    id: usuario.id,
    username: usuario.username,
    email: usuario.email,
    perfilId,
    perfilNome,
    isAdmin: perfilNome.toLowerCase() === 'adm'
  };
}

export function mapApiUsuarioResponseListToVmList(
  usuarios: ApiUsuarioResponse[]
): UsuarioAdminVm[] {
  return usuarios.map(mapApiUsuarioResponseToVm);
}
