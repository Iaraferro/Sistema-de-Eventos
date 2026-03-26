import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { EventoAdminVm } from '../../core/models/evento-admin-vm.model';
import { UsuarioAdminVm } from '../../core/models/usuario-admin-vm.model';
import { EventosAdminService } from '../../core/services/eventos-admin.service';
import { UsuariosAdminService } from '../../core/services/usuarios-admin.service';

interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  icon: string;
  tone: 'success' | 'primary' | 'warning' | 'info';
}

interface DashboardTask {
  title: string;
  description: string;
  meta: string;
}

interface TimelineItem {
  title: string;
  helper: string;
  tone: 'success' | 'primary' | 'warning';
}

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [RouterLink],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.css'
})
export class AdminDashboardPageComponent {
  private readonly eventosAdminService = inject(EventosAdminService);
  private readonly usuariosAdminService = inject(UsuariosAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly eventos = signal<EventoAdminVm[]>([]);
  readonly usuarios = signal<UsuarioAdminVm[]>([]);

  readonly metrics = computed<DashboardMetric[]>(() => {
    const eventos = this.eventos();
    const usuarios = this.usuarios();
    const futuros = eventos.filter((evento) => evento.estado !== 'past').length;
    const realizados = eventos.filter((evento) => evento.estado === 'past').length;
    const admins = usuarios.filter((usuario) => usuario.isAdmin).length;

    return [
      {
        label: 'Eventos totais',
        value: String(eventos.length),
        delta: `${futuros} futuros ou em andamento`,
        icon: 'bi bi-calendar2-week',
        tone: 'primary'
      },
      {
        label: 'Usuários mapeados',
        value: String(usuarios.length),
        delta: `${admins} com perfil administrativo`,
        icon: 'bi bi-people',
        tone: 'success'
      },
      {
        label: 'Eventos realizados',
        value: String(realizados),
        delta: 'Histórico disponível para relatórios',
        icon: 'bi bi-graph-up-arrow',
        tone: 'info'
      },
      {
        label: 'Alertas operacionais',
        value: eventos.length === 0 ? '1' : '0',
        delta: eventos.length === 0 ? 'Sem eventos cadastrados' : 'Painel sincronizado',
        icon: 'bi bi-exclamation-triangle',
        tone: 'warning'
      }
    ];
  });

  readonly timeline = computed<TimelineItem[]>(() => {
    const futuros = [...this.eventos()]
      .filter((evento) => evento.estado !== 'past')
      .slice(0, 3);

    if (futuros.length === 0) {
      return [
        {
          title: 'Nenhum evento futuro encontrado',
          helper: 'Cadastre ou revise eventos para alimentar a agenda administrativa.',
          tone: 'warning'
        }
      ];
    }

    return futuros.map((evento, index) => ({
      title: `${evento.titulo} · ${evento.dataLabel}`,
      helper: `${evento.local} · ${evento.horarioLabel}`,
      tone: index === 0 ? 'success' : index === 1 ? 'primary' : 'warning'
    }));
  });

  readonly tasks = computed<DashboardTask[]>(() => [
    {
      title: 'Revisar agenda da semana',
      description: `Há ${this.eventos().filter((evento) => evento.estado !== 'past').length} eventos futuros para acompanhar.`,
      meta: 'Prioridade alta'
    },
    {
      title: 'Conferir usuários operacionais',
      description: `${this.usuarios().length} usuários retornados pela API atual.`,
      meta: 'Rotina administrativa'
    },
    {
      title: 'Gerar checkpoint manual',
      description: 'Validar CRUD, listagens e responsividade antes da etapa de segurança.',
      meta: 'Bloqueador da próxima fase'
    }
  ]);

  constructor() {
    this.loadDashboard();
  }

  reload(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      eventos: this.eventosAdminService.listEventosVm(),
      usuarios: this.usuariosAdminService.listUsuariosVm().pipe(
        catchError(() => of<UsuarioAdminVm[]>([]))
      )
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ eventos, usuarios }) => {
          this.eventos.set(eventos);
          this.usuarios.set(usuarios);
        },
        error: () => {
          this.error.set('Não foi possível carregar o resumo administrativo com a API atual.');
        }
      });
  }
}
