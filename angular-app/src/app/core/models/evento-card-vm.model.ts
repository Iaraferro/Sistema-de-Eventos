export type EventoStatus = 'upcoming' | 'today' | 'past';

export interface EventoCardVm {
  id: number;
  title: string;
  description: string;
  excerpt: string;
  location: string;
  categoryLabel: string;
  imageUrl: string;
  dayLabel: string;
  monthLabel: string;
  status: EventoStatus;
  statusLabel: string;
  statusBadgeClass: string;
  timestamp: number;
  isPast: boolean;
  ariaLabel: string;
}
