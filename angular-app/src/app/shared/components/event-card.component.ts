import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventoCardVm } from '../../core/models/evento-card-vm.model';

@Component({
  selector: 'app-event-card',
  imports: [RouterLink],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent {
  readonly event = input.required<EventoCardVm>();
}
