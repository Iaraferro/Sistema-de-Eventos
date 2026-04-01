import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, filter, of } from 'rxjs';
import { UsuarioAdminVm } from '../../core/models/usuario-admin-vm.model';
import { AuthService } from '../../core/services/auth.service';

interface AdminNavItem {
  label: string;
  route: string;
  icon: string;
  description: string;
  badge?: string;
}

const DEFAULT_NAV_ITEMS: AdminNavItem[] = [
  {
    label: 'Dashboard',
    route: '/admin/dashboard',
    icon: 'bi bi-grid-1x2',
    description: 'Resumo operacional do painel',
  },
  {
    label: 'Eventos',
    route: '/admin/eventos',
    icon: 'bi bi-calendar-event',
    description: 'Cadastros, agenda e arquivos',
  },
  {
    label: 'Participantes',
    route: '/admin/participantes',
    icon: 'bi bi-people',
    description: 'Usuarios e referencia operacional',
  },
  {
    label: 'Relatorios',
    route: '/admin/relatorios',
    icon: 'bi bi-graph-up',
    description: 'Indicadores e exportacoes',
  },
  {
    label: 'Configuracoes',
    route: '/admin/configuracoes',
    icon: 'bi bi-gear',
    description: 'Preferencias do sistema',
  },
];

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css',
})
export class AdminShellComponent {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly navItems = signal(DEFAULT_NAV_ITEMS);
  readonly currentProfile = signal<UsuarioAdminVm | null>(null);
  readonly isSidebarOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeSidebar());

    if (this.authService.isAuthenticated()) {
      this.authService
        .getProfileVm()
        .pipe(
          catchError(() => of<UsuarioAdminVm | null>(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((profile) => this.currentProfile.set(profile));
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth >= 992) {
      this.closeSidebar();
    }
  }

  hasSession(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.currentProfile.set(null);
  }
}
