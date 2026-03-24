import { Routes } from '@angular/router';
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
    path: '**',
    redirectTo: ''
  }
];
