import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { EventoCardVm } from '../../core/models/evento-card-vm.model';
import { EventosApiService } from '../../core/services/eventos-api.service';
import { EventCardComponent } from '../../shared/components/event-card.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, EventCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  private readonly eventosApiService = inject(EventosApiService);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly upcomingEvents = signal<EventoCardVm[]>([]);
  readonly completedEvents = signal<EventoCardVm[]>([]);
  readonly hasNoUpcomingEvents = computed(
    () => !this.isLoading() && !this.errorMessage() && this.upcomingEvents().length === 0
  );
  readonly hasNoCompletedEvents = computed(
    () => !this.isLoading() && !this.errorMessage() && this.completedEvents().length === 0
  );

  constructor() {
    this.title.setTitle('EcoEventos Palmas - Sistema de Eventos Ambientais');
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.eventosApiService
      .listPublicEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (eventos) => {
          const upcomingEvents = eventos.filter((evento) => !evento.isPast);
          const completedEvents = eventos
            .filter((evento) => evento.isPast)
            .sort((current, next) => next.timestamp - current.timestamp);

          this.upcomingEvents.set(upcomingEvents);
          this.completedEvents.set(completedEvents);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'Nao foi possivel carregar os eventos. Tente novamente em alguns instantes.'
          );
          this.upcomingEvents.set([]);
          this.completedEvents.set([]);
          this.isLoading.set(false);
        }
      });
  }
}
