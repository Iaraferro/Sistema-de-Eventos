import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { mapApiEventoToCardVm, mapApiEventoToDetailVm } from '../mappers/evento.mapper';
import { ApiEvento } from '../models/api-evento.model';
import { EventoCardVm } from '../models/evento-card-vm.model';
import { EventoDetailVm } from '../models/evento-detail-vm.model';

@Injectable({ providedIn: 'root' })
export class EventosApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  listEventos(): Observable<ApiEvento[]> {
    return this.http.get<ApiEvento[]>(`${this.apiBaseUrl}/eventos`);
  }

  getEventoById(id: number): Observable<ApiEvento> {
    return this.http.get<ApiEvento>(`${this.apiBaseUrl}/eventos/${id}`);
  }

  listPublicEvents(): Observable<EventoCardVm[]> {
    return this.listEventos().pipe(
      map((eventos) =>
        eventos
          .map((evento) => mapApiEventoToCardVm(evento, this.apiBaseUrl))
          .sort((current, next) => current.timestamp - next.timestamp)
      )
    );
  }

  getPublicEventDetail(id: number): Observable<EventoDetailVm> {
    return this.getEventoById(id).pipe(
      map((evento) => mapApiEventoToDetailVm(evento, this.apiBaseUrl))
    );
  }
}
