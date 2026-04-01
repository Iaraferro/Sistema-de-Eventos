import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  mapAdminFormToApiEvento,
  mapApiEventoListToAdminVmList,
  mapApiEventoToAdminForm,
} from '../mappers/evento-admin.mapper';
import { ApiEvento } from '../models/api-evento.model';
import { EventoAdminFormModel } from '../models/evento-admin-form.model';
import { EventoAdminVm } from '../models/evento-admin-vm.model';
import { ApiClientService } from './api-client.service';
import { normalizeEventoListResponse, normalizeSingleEventoResponse } from './eventos-api.service';

@Injectable({ providedIn: 'root' })
export class EventosAdminService {
  private readonly apiClient = inject(ApiClientService);

  listEventos(): Observable<ApiEvento[]> {
    return this.apiClient
      .getUnknown('/eventos', { auth: true })
      .pipe(map((response) => normalizeEventoListResponse(response)));
  }

  listEventosVm(): Observable<EventoAdminVm[]> {
    return this.listEventos().pipe(
      map((eventos) => mapApiEventoListToAdminVmList(eventos, this.apiClient.getBaseUrl())),
    );
  }

  getEvento(id: number): Observable<ApiEvento> {
    return this.apiClient
      .getUnknown(`/eventos/${id}`, { auth: true })
      .pipe(map((response) => normalizeSingleEventoResponse(response)));
  }

  getEventoForm(id: number): Observable<EventoAdminFormModel> {
    return this.getEvento(id).pipe(
      map((evento) => mapApiEventoToAdminForm(evento, this.apiClient.getBaseUrl())),
    );
  }

  createEvento(form: EventoAdminFormModel): Observable<ApiEvento> {
    return this.apiClient.post<ApiEvento>('/eventos', mapAdminFormToApiEvento(form), {
      auth: true,
    });
  }

  updateEvento(id: number, form: EventoAdminFormModel): Observable<ApiEvento> {
    return this.apiClient.put<ApiEvento>(`/eventos/${id}`, mapAdminFormToApiEvento(form), {
      auth: true,
    });
  }

  deleteEvento(id: number): Observable<void> {
    return this.apiClient.delete<void>(`/eventos/${id}`, { auth: true });
  }
}
