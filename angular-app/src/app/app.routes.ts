import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/guards/admin-auth.guard';
import { adminGuestGuard } from './core/guards/admin-guest.guard';
import { PublicLayoutComponent } from './layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home-page.component').then(
            (module) => module.HomePageComponent
          ),
        title: 'EcoEventos Palmas - Sistema de Eventos Ambientais'
      },
      {
        path: 'eventos/:id',
        loadComponent: () =>
          import('./features/event-detail/event-detail-page.component').then(
            (module) => module.EventDetailPageComponent
          ),
        title: 'Detalhes do Evento - EcoEventos Palmas'
      }
    ]
  },
  {
    path: 'admin/acesso',
    canActivate: [adminGuestGuard],
    loadComponent: () =>
      import('./features/admin-access/admin-access-page.component').then(
        (module) => module.AdminAccessPageComponent
      ),
    title: 'Acesso Administrativo - EcoEventos Palmas'
  },
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    canActivateChild: [adminAuthGuard],
    loadComponent: () =>
      import('./features/admin-shell/admin-shell.component').then(
        (module) => module.AdminShellComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin-dashboard/admin-dashboard-page.component').then(
            (module) => module.AdminDashboardPageComponent
          ),
        title: 'Dashboard Administrativo - EcoEventos Palmas'
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./features/admin-events/admin-events-page.component').then(
            (module) => module.AdminEventsPageComponent
          ),
        title: 'Eventos Administrativos - EcoEventos Palmas'
      },
      {
        path: 'participantes',
        loadComponent: () =>
          import('./features/admin-participants/admin-participants-page.component').then(
            (module) => module.AdminParticipantsPageComponent
          ),
        title: 'Participantes - EcoEventos Palmas'
      },
      {
        path: 'relatorios',
        loadComponent: () =>
          import('./features/admin-reports/admin-reports-page.component').then(
            (module) => module.AdminReportsPageComponent
          ),
        title: 'Relatórios - EcoEventos Palmas'
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./features/admin-settings/admin-settings-page.component').then(
            (module) => module.AdminSettingsPageComponent
          ),
        title: 'Configurações - EcoEventos Palmas'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
