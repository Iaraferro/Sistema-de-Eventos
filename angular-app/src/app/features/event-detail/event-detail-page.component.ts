import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, EMPTY, map, switchMap } from 'rxjs';
import { EventoDetailVm } from '../../core/models/evento-detail-vm.model';
import { EventosApiService } from '../../core/services/eventos-api.service';

@Component({
  selector: 'app-event-detail-page',
  imports: [RouterLink],
  templateUrl: './event-detail-page.component.html',
  styleUrl: './event-detail-page.component.css'
})
export class EventDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly eventosApiService = inject(EventosApiService);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly event = signal<EventoDetailVm | null>(null);

  constructor() {
    this.title.setTitle('Detalhes do Evento - EcoEventos Palmas');

    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        distinctUntilChanged(),
        switchMap((id) => {
          if (!Number.isInteger(id) || id <= 0) {
            this.isLoading.set(false);
            this.errorMessage.set('Evento não encontrado.');
            this.event.set(null);
            return EMPTY;
          }

          this.isLoading.set(true);
          this.errorMessage.set(null);

          return this.eventosApiService.getPublicEventDetail(id).pipe(
            catchError(() => {
              this.isLoading.set(false);
              this.errorMessage.set('Evento não encontrado ou indisponível.');
              this.event.set(null);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((evento) => {
        this.event.set(evento);
        this.isLoading.set(false);
        this.title.setTitle(`${evento.title} - EcoEventos Palmas`);
      });
  }
}
