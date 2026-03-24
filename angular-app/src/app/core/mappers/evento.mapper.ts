import { ApiEvento } from '../models/api-evento.model';
import { EventoCardVm, EventoStatus } from '../models/evento-card-vm.model';
import { EventoDetailVm } from '../models/evento-detail-vm.model';

const LOCALE = 'pt-BR';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80';
const DEFAULT_CATEGORY = 'Evento Ambiental';
const DEFAULT_ORGANIZER = 'EcoEventos Palmas';
const DEFAULT_CONTACT = 'contato@ecoeventospalmas.local';
const DEFAULT_REQUIREMENTS =
  'Traga disposicao, garrafa de agua e vontade de contribuir com a preservacao ambiental.';

export function mapApiEventoToCardVm(
  evento: ApiEvento,
  apiBaseUrl: string
): EventoCardVm {
  const date = parseDate(evento.dataHora);
  const status = resolveStatus(date);
  const title = normalizeText(evento.nome, 'Evento sem titulo');
  const description = normalizeText(evento.descricao, 'Descricao nao disponivel.');

  return {
    id: evento.id ?? 0,
    title,
    description,
    excerpt: buildExcerpt(description, 100),
    location: normalizeText(evento.local, 'Local a confirmar'),
    categoryLabel: DEFAULT_CATEGORY,
    imageUrl: resolveEventImage(evento, apiBaseUrl),
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
    ariaLabel: `Abrir detalhes de ${title}`
  };
}

export function mapApiEventoToDetailVm(
  evento: ApiEvento,
  apiBaseUrl: string
): EventoDetailVm {
  const date = parseDate(evento.dataHora);
  const status = resolveStatus(date);
  const title = normalizeText(evento.nome, 'Evento sem titulo');
  const description = normalizeText(evento.descricao, 'Descricao nao disponivel.');
  const imageUrl = resolveEventImage(evento, apiBaseUrl);

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
          year: 'numeric'
        }).format(date)
      : 'Data a confirmar',
    timeLabel: date
      ? new Intl.DateTimeFormat(LOCALE, {
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
      : 'A confirmar',
    organizerLabel: DEFAULT_ORGANIZER,
    contactLabel: DEFAULT_CONTACT,
    requirementsLabel: DEFAULT_REQUIREMENTS,
    participantsLabel: '0 participantes',
    statusLabel: getStatusLabel(status),
    isPast: status === 'past'
  };
}

function normalizeText(value: string | null, fallback: string): string {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : fallback;
}

function parseDate(dateTime: string | null): Date | null {
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

function resolveEventImage(evento: ApiEvento, apiBaseUrl: string): string {
  const firstFile = evento.arquivos?.find(
    (arquivo) => typeof arquivo === 'string' && arquivo.trim().length > 0
  );

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
