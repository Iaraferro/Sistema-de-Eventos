export interface UsuarioAdminVm {
  id: number;
  username: string;
  email: string;
  perfilId: number | null;
  perfilNome: string;
  isAdmin: boolean;
}
