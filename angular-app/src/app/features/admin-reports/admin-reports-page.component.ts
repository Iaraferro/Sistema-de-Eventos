import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { EventoAdminVm } from '../../core/models/evento-admin-vm.model';
import { UsuarioAdminVm } from '../../core/models/usuario-admin-vm.model';
import { EventosAdminService } from '../../core/services/eventos-admin.service';
import { UsuariosAdminService } from '../../core/services/usuarios-admin.service';

interface ReportCard {
  title: string;
  value: string;
  helper: string;
  tone: 'success' | 'primary' | 'warning' | 'info';
}

@Component({
  selector: 'app-admin-reports-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-reports-page.component.html',
  styleUrl: './admin-reports-page.component.css',
})
export class AdminReportsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly eventosAdminService = inject(EventosAdminService);
  private readonly usuariosAdminService = inject(UsuariosAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly exportFeedback = signal<string | null>(null);
  readonly eventos = signal<EventoAdminVm[]>([]);
  readonly usuarios = signal<UsuarioAdminVm[]>([]);

  readonly reportForm = this.formBuilder.nonNullable.group({
    titulo: ['Relatório operacional do admin', [Validators.required, Validators.minLength(4)]],
    resumo: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly reports = computed<ReportCard[]>(() => [
    {
      title: 'Eventos totais',
      value: String(this.eventos().length),
      helper: 'Dados vindos de GET /eventos',
      tone: 'success',
    },
    {
      title: 'Perfis admin',
      value: String(this.usuarios().filter((usuario) => usuario.isAdmin).length),
      helper: 'Leitura de GET /usuarios',
      tone: 'primary',
    },
    {
      title: 'Eventos futuros',
      value: String(this.eventos().filter((evento) => evento.estado !== 'past').length),
      helper: 'Agenda usada no dashboard',
      tone: 'info',
    },
    {
      title: 'Alertas',
      value: this.eventos().length === 0 ? '1' : '0',
      helper: this.eventos().length === 0 ? 'Nenhum evento cadastrado' : 'Sem alertas críticos',
      tone: 'warning',
    },
  ]);

  constructor() {
    this.loadData();
  }

  exportTxt(): void {
    const payload = [
      `Título: ${this.reportForm.controls.titulo.value}`,
      `Resumo: ${this.reportForm.controls.resumo.value}`,
      `Eventos totais: ${this.eventos().length}`,
      `Usuários totais: ${this.usuarios().length}`,
      `Eventos futuros: ${this.eventos().filter((evento) => evento.estado !== 'past').length}`,
    ].join('\n');

    this.downloadBlob(
      'relatorio-admin.txt',
      new Blob([payload], { type: 'text/plain;charset=utf-8' }),
    );
    this.exportFeedback.set('Resumo exportado em TXT com base nos dados atuais da API.');
  }

  exportJson(): void {
    const payload = {
      titulo: this.reportForm.controls.titulo.value,
      resumo: this.reportForm.controls.resumo.value,
      eventos: this.eventos(),
      usuarios: this.usuarios(),
    };

    this.downloadBlob(
      'relatorio-admin.json',
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }),
    );
    this.exportFeedback.set('Dados exportados em JSON para analise local.');
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      eventos: this.eventosAdminService.listEventosVm(),
      usuarios: this.usuariosAdminService.listUsuariosVm(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ eventos, usuarios }) => {
          this.eventos.set(eventos);
          this.usuarios.set(usuarios);
          this.reportForm.patchValue({
            resumo: `Base atual com ${eventos.length} eventos e ${usuarios.length} usuários sincronizados.`,
          });
        },
        error: () => {
          this.error.set('Não foi possível consolidar os dados para os relatórios.');
        },
      });
  }

  private downloadBlob(fileName: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
