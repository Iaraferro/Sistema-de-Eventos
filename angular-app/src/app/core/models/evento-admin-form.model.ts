export type EventoAdminStatus = 'ativo' | 'inativo' | 'pendente';

export interface EventoAdminFormModel {
  id?: number;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  local: string;
  categoria: string;
  organizador: string;
  contato: string;
  requisitos: string;
  participantes: number;
  status: EventoAdminStatus;
  imagem: string;
  arquivos: string[];
}

