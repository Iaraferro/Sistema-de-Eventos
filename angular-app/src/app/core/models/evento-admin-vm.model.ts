export type EventoAdminState = 'future' | 'today' | 'past';

export interface EventoAdminVm {
  id: number;
  titulo: string;
  descricao: string;
  dataHoraIso: string;
  dataLabel: string;
  horarioLabel: string;
  local: string;
  imagem: string;
  arquivos: string[];
  estado: EventoAdminState;
  estadoLabel: string;
}
