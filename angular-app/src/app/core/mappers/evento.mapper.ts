import { ApiEvento } from '../models/api-evento.model';
import { EventoCardVm, EventoStatus } from '../models/evento-card-vm.model';
import { EventoDetailVm } from '../models/evento-detail-vm.model';

const LOCALE = 'pt-BR';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1350&q=80';
const DEFAULT_CATEGORY = 'Evento ambiental';
const DEFAULT_ORGANIZER = 'EcoEventos Palmas';
const DEFAULT_CONTACT = 'contato@ecoeventospalmas.com';
const DEFAULT_REQUIREMENTS =
  'Traga disposição, garrafa de água e vontade de contribuir com a preservação ambiental.';

export function mapApiEventoToCardVm(evento: ApiEvento, apiBaseUrl: string): EventoCardVm {
  const date = normalizeDateTimeValue(evento.dataHora);
  const status = resolveStatus(date);
  const title = normalizeText(evento.nome, 'Evento sem título');
  const description = normalizeText(evento.descricao, 'Descrição não disponível.');

  return {
    id: evento.id ?? 0,
    title,
    description,
    excerpt: buildExcerpt(description, 100),
    location: normalizeText(evento.local, 'Local a confirmar'),
    categoryLabel: DEFAULT_CATEGORY,
    imageUrl: resolveEventImageUrl(evento, apiBaseUrl),
    dayLabel: date ? new Intl.DateTimeFormat(LOCALE, { day: '2-digit' }).format(date) : '--',
    monthLabel: date
      ? new Intl.DateTimeFormat(LOCALE, { month: 'short' })
          .format(date)
          .replace('.', '')
          .toUpperCase()
      : '--',
    status,
    statusLabel: getStatusLabel(status),
    statusBadgeClass: getStatusBadgeClass(status),
    timestamp: date?.getTime() ?? Number.MAX_SAFE_INTEGER,
    isPast: status === 'past',
    ariaLabel: `Abrir detalhes de ${title}`,
  };
}

export function mapApiEventoToDetailVm(evento: ApiEvento, apiBaseUrl: string): EventoDetailVm {
  const date = normalizeDateTimeValue(evento.dataHora);
  const status = resolveStatus(date);
  const title = normalizeText(evento.nome, 'Evento sem título');
  const description = normalizeText(evento.descricao, 'Descrição não disponível.');
  const imageUrl = resolveEventImageUrl(evento, apiBaseUrl);

  return {
    id: evento.id ?? 0,
    title,
    description,
    excerpt: buildExcerpt(description, 150),
    location: normalizeText(evento.local, 'Local a confirmar'),
    categoryLabel: DEFAULT_CATEGORY,
    imageUrl,
    heroImageUrl: imageUrl,
    fullDateLabel: date
      ? new Intl.DateTimeFormat(LOCALE, {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(date)
      : 'Data a confirmar',
    timeLabel: date
      ? new Intl.DateTimeFormat(LOCALE, {
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
      : 'A confirmar',
    organizerLabel: DEFAULT_ORGANIZER,
    contactLabel: DEFAULT_CONTACT,
    requirementsLabel: DEFAULT_REQUIREMENTS,
    participantsLabel: '0 participantes',
    statusLabel: getStatusLabel(status),
    isPast: status === 'past',
  };
}

function normalizeText(value: string | null, fallback: string): string {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : fallback;
}

export function normalizeDateTimeValue(dateTime: string | null): Date | null {
  if (!dateTime) {
    return null;
  }

  const parsedDate = new Date(dateTime);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function resolveStatus(date: Date | null): EventoStatus {
  if (!date) {
    return 'upcoming';
  }

  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (sameDay) {
    return 'today';
  }

  return date.getTime() < now.getTime() ? 'past' : 'upcoming';
}

function getStatusLabel(status: EventoStatus): string {
  switch (status) {
    case 'past':
      return 'Realizado';
    case 'today':
      return 'Hoje';
    default:
      return 'Em breve';
  }
}

function getStatusBadgeClass(status: EventoStatus): string {
  switch (status) {
    case 'past':
      return 'bg-secondary';
    case 'today':
      return 'bg-success';
    default:
      return 'bg-warning text-dark';
  }
}

export function resolveEventImageUrl(evento: ApiEvento, apiBaseUrl: string): string {
  const firstFile = evento.arquivos?.find((arquivo) => !!arquivo?.trim());

  if (!firstFile) {
    return FALLBACK_IMAGE;
  }

  if (firstFile.startsWith('http')) {
    return firstFile;
  }

  return `${normalizeBaseUrl(apiBaseUrl)}/arquivos/${encodeURIComponent(firstFile.trim())}`;
}

function normalizeBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
}

function buildExcerpt(text: string, size: number): string {
  if (text.length <= size) {
    return text;
  }

  return `${text.slice(0, size).trimEnd()}...`;
}

export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDisplayTime(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}
