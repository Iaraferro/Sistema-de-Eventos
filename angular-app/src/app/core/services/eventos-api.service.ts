import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { mapApiEventoToCardVm, mapApiEventoToDetailVm } from '../mappers/evento.mapper';
import { ApiEvento } from '../models/api-evento.model';
import { EventoCardVm } from '../models/evento-card-vm.model';
import { EventoDetailVm } from '../models/evento-detail-vm.model';
import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class EventosApiService {
  private readonly apiClient = inject(ApiClientService);

  listEventos(): Observable<ApiEvento[]> {
    return this.apiClient
      .getUnknown('/eventos')
      .pipe(map((response) => normalizeEventoListResponse(response)));
  }

  getEventoById(id: number): Observable<ApiEvento> {
    return this.apiClient
      .getUnknown(`/eventos/${id}`)
      .pipe(map((response) => normalizeSingleEventoResponse(response)));
  }

  listPublicEvents(): Observable<EventoCardVm[]> {
    return this.listEventos().pipe(
      map((eventos) =>
        eventos
          .map((evento) => mapApiEventoToCardVm(evento, this.apiClient.getBaseUrl()))
          .sort((current, next) => current.timestamp - next.timestamp),
      ),
    );
  }

  getPublicEventDetail(id: number): Observable<EventoDetailVm> {
    return this.getEventoById(id).pipe(
      map((evento) => mapApiEventoToDetailVm(evento, this.apiClient.getBaseUrl())),
    );
  }
}

export function normalizeEventoListResponse(response: unknown): ApiEvento[] {
  const rawArray = extractEventoArray(response);
  return rawArray.map(normalizeApiEvento);
}

export function normalizeSingleEventoResponse(response: unknown): ApiEvento {
  const unwrapped = unwrapSingleEventoResponse(response);

  if (isRecord(unwrapped)) {
    return normalizeApiEvento(unwrapped);
  }

  throw new Error('Resposta de evento invalida.');
}

function extractEventoArray(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isRecord(response)) {
    return [];
  }

  const candidateKeys = ['eventos', 'content', 'data', 'items', 'result', 'results', 'records'];

  for (const key of candidateKeys) {
    const value = response[key];
    if (Array.isArray(value)) {
      return value;
    }

    if (isRecord(value)) {
      for (const nestedKey of candidateKeys) {
        const nestedValue = value[nestedKey];
        if (Array.isArray(nestedValue)) {
          return nestedValue;
        }
      }
    }
  }

  for (const value of Object.values(response)) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function unwrapSingleEventoResponse(response: unknown): unknown {
  if (!isRecord(response)) {
    return response;
  }

  const candidateKeys = ['evento', 'data', 'item', 'content', 'result'];

  for (const key of candidateKeys) {
    const value = response[key];
    if (isRecord(value)) {
      return value;
    }
  }

  return response;
}

function normalizeApiEvento(value: unknown): ApiEvento {
  const record = isRecord(value) ? value : {};
  const arquivos = normalizeArquivos(
    record['arquivos'] ?? record['arquivo'] ?? record['files'] ?? record['anexos'],
  );

  return {
    id: toNumberOrNull(record['id'] ?? record['idEvento']),
    nome: toStringOrNull(record['nome'] ?? record['titulo'] ?? record['name']),
    descricao: toStringOrNull(record['descricao'] ?? record['description']),
    dataHora: toStringOrNull(
      record['dataHora'] ?? record['data_hora'] ?? record['dataEvento'] ?? record['data'],
    ),
    local: toStringOrNull(record['local'] ?? record['endereco'] ?? record['location']),
    arquivos,
  };
}

function normalizeArquivos(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (isRecord(item)) {
        return (
          toStringOrNull(item['nomeSalvo']) ??
          toStringOrNull(item['nomeArquivo']) ??
          toStringOrNull(item['nomeOriginal']) ??
          ''
        );
      }

      return '';
    })
    .filter(Boolean);
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  return String(value);
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
