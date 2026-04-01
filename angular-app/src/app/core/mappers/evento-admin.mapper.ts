import { ApiEvento } from '../models/api-evento.model';
import { EventoAdminFormModel } from '../models/evento-admin-form.model';
import { EventoAdminState, EventoAdminVm } from '../models/evento-admin-vm.model';
import {
  formatDateInputValue,
  formatDisplayDate,
  formatDisplayTime,
  normalizeDateTimeValue,
  resolveEventImageUrl,
} from './evento.mapper';

export function mapApiEventoToAdminVm(evento: ApiEvento, apiBaseUrl: string): EventoAdminVm {
  const data = normalizeDateTimeValue(evento.dataHora);
  const estado = resolveState(data);

  return {
    id: evento.id ?? 0,
    titulo: normalizeText(evento.nome, 'Evento sem título'),
    descricao: normalizeText(evento.descricao, 'Descrição não informada.'),
    dataHoraIso: data?.toISOString() ?? '',
    dataLabel: data ? formatDisplayDate(data) : 'Data a confirmar',
    horarioLabel: data ? formatDisplayTime(data) : 'Horário a confirmar',
    local: normalizeText(evento.local, 'Local a confirmar'),
    imagem: resolveEventImageUrl(evento, apiBaseUrl),
    arquivos: [...(evento.arquivos ?? [])],
    estado,
    estadoLabel: resolveStateLabel(estado),
  };
}

export function mapApiEventoListToAdminVmList(
  eventos: ApiEvento[],
  apiBaseUrl: string,
): EventoAdminVm[] {
  return eventos.map((evento) => mapApiEventoToAdminVm(evento, apiBaseUrl));
}

export function mapApiEventoToAdminForm(
  evento: ApiEvento,
  apiBaseUrl: string,
): EventoAdminFormModel {
  const data = normalizeDateTimeValue(evento.dataHora);
  const firstArquivo = evento.arquivos?.find((arquivo) => !!arquivo?.trim()) ?? '';

  return {
    id: evento.id ?? undefined,
    titulo: normalizeText(evento.nome, ''),
    descricao: normalizeText(evento.descricao, ''),
    data: data ? formatDateInputValue(data) : '',
    hora: data
      ? `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`
      : '10:00',
    local: normalizeText(evento.local, ''),
    categoria: 'Evento institucional',
    organizador: 'admin',
    contato: '',
    requisitos: '',
    participantes: 0,
    status: 'ativo',
    imagem: firstArquivo,
    arquivos: [...(evento.arquivos ?? [])],
  };
}

export function mapAdminFormToApiEvento(form: EventoAdminFormModel): ApiEvento {
  const safeDate = form.data.trim();
  const safeHour = form.hora.trim() || '10:00';

  return {
    id: form.id ?? null,
    nome: form.titulo.trim(),
    descricao: form.descricao.trim(),
    dataHora: safeDate ? `${safeDate}T${safeHour}:00` : null,
    local: form.local.trim(),
    arquivos: [...form.arquivos],
  };
}

function resolveState(data: Date | null): EventoAdminState {
  if (!data) {
    return 'future';
  }

  const now = new Date();
  const sameDay =
    data.getDate() === now.getDate() &&
    data.getMonth() === now.getMonth() &&
    data.getFullYear() === now.getFullYear();

  if (sameDay) {
    return 'today';
  }

  return data.getTime() < now.getTime() ? 'past' : 'future';
}

function resolveStateLabel(state: EventoAdminState): string {
  switch (state) {
    case 'past':
      return 'Realizado';
    case 'today':
      return 'Hoje';
    default:
      return 'Em breve';
  }
}

function normalizeText(value: string | null, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}
