import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, of, switchMap } from 'rxjs';
import { EventoAdminFormModel, EventoAdminStatus } from '../../core/models/evento-admin-form.model';
import { EventoAdminVm } from '../../core/models/evento-admin-vm.model';
import { ArquivosAdminService } from '../../core/services/arquivos-admin.service';
import { EventosAdminService } from '../../core/services/eventos-admin.service';

@Component({
  selector: 'app-admin-events-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-events-page.component.html',
  styleUrl: './admin-events-page.component.css',
})
export class AdminEventsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly eventosAdminService = inject(EventosAdminService);
  private readonly arquivosAdminService = inject(ArquivosAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly feedback = signal<string | null>(null);
  readonly eventos = signal<EventoAdminVm[]>([]);
  readonly editingEventId = signal<number | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);

  readonly eventForm = this.formBuilder.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(4)]],
    descricao: ['', [Validators.required, Validators.minLength(10)]],
    data: ['', Validators.required],
    hora: ['10:00', Validators.required],
    local: ['', [Validators.required, Validators.minLength(4)]],
    categoria: ['Evento institucional'],
    organizador: ['admin'],
    contato: [''],
    requisitos: [''],
    participantes: [0],
    status: this.formBuilder.control<EventoAdminStatus>('ativo', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    imagem: [''],
  });

  constructor() {
    this.loadEventos();
  }

  loadEventos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventosAdminService
      .listEventosVm()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (eventos) => this.eventos.set(eventos),
        error: (error) => {
          this.error.set(
            resolveErrorMessage(error, 'Nao foi possivel carregar os eventos administrativos.'),
          );
        },
      });
  }

  startCreate(): void {
    this.feedback.set(null);
    this.editingEventId.set(null);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.eventForm.reset({
      titulo: '',
      descricao: '',
      data: '',
      hora: '10:00',
      local: '',
      categoria: 'Evento institucional',
      organizador: 'admin',
      contato: '',
      requisitos: '',
      participantes: 0,
      status: 'ativo',
      imagem: '',
    });
  }

  editEvento(evento: EventoAdminVm): void {
    this.feedback.set(null);
    this.editingEventId.set(evento.id);

    this.eventosAdminService
      .getEventoForm(evento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (form) => {
          this.eventForm.reset({
            titulo: form.titulo,
            descricao: form.descricao,
            data: form.data,
            hora: form.hora,
            local: form.local,
            categoria: form.categoria,
            organizador: form.organizador,
            contato: form.contato,
            requisitos: form.requisitos,
            participantes: form.participantes,
            status: form.status,
            imagem: form.imagem,
          });
          this.selectedFile.set(null);
          this.previewUrl.set(
            form.imagem ? this.arquivosAdminService.resolveArquivoUrl(form.imagem) : null,
          );
        },
        error: (error) => {
          this.feedback.set(
            resolveErrorMessage(error, 'Nao foi possivel preparar a edicao do evento.'),
          );
        },
      });
  }

  submit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const value = this.eventForm.getRawValue();
    const file = this.selectedFile();

    this.saving.set(true);
    this.feedback.set(null);

    const arquivosAtuais =
      this.editingEventId() === null
        ? []
        : (this.eventos().find((evento) => evento.id === this.editingEventId())?.arquivos ?? []);

    const request$ = (
      file
        ? this.arquivosAdminService.uploadArquivo(file).pipe(
            switchMap((nomeSalvo) =>
              of<EventoAdminFormModel>({
                id: this.editingEventId() ?? undefined,
                titulo: value.titulo.trim(),
                descricao: value.descricao.trim(),
                data: value.data,
                hora: value.hora || '10:00',
                local: value.local.trim(),
                categoria: value.categoria,
                organizador: value.organizador,
                contato: value.contato,
                requisitos: value.requisitos,
                participantes: Number(value.participantes) || 0,
                status: value.status,
                imagem: nomeSalvo,
                arquivos: [nomeSalvo, ...arquivosAtuais.filter((arquivo) => arquivo !== nomeSalvo)],
              }),
            ),
          )
        : of<EventoAdminFormModel>({
            id: this.editingEventId() ?? undefined,
            titulo: value.titulo.trim(),
            descricao: value.descricao.trim(),
            data: value.data,
            hora: value.hora || '10:00',
            local: value.local.trim(),
            categoria: value.categoria,
            organizador: value.organizador,
            contato: value.contato,
            requisitos: value.requisitos,
            participantes: Number(value.participantes) || 0,
            status: value.status,
            imagem: value.imagem,
            arquivos: value.imagem
              ? [value.imagem, ...arquivosAtuais.filter((arquivo) => arquivo !== value.imagem)]
              : arquivosAtuais,
          })
    ).pipe(
      switchMap((payload) =>
        this.editingEventId()
          ? this.eventosAdminService.updateEvento(this.editingEventId()!, payload)
          : this.eventosAdminService.createEvento(payload),
      ),
    );

    request$
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          const editing = this.editingEventId() !== null;
          this.feedback.set(
            editing ? 'Evento atualizado com sucesso.' : 'Evento criado com sucesso.',
          );
          this.startCreate();
          this.loadEventos();
        },
        error: (error) => {
          this.feedback.set(resolveErrorMessage(error, 'Nao foi possivel salvar o evento.'));
        },
      });
  }

  deleteEvento(evento: EventoAdminVm): void {
    const confirmed = window.confirm(`Excluir o evento "${evento.titulo}"?`);

    if (!confirmed) {
      return;
    }

    this.eventosAdminService
      .deleteEvento(evento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.feedback.set('Evento removido com sucesso.');
          if (this.editingEventId() === evento.id) {
            this.startCreate();
          }
          this.loadEventos();
        },
        error: (error) => {
          this.feedback.set(resolveErrorMessage(error, 'Nao foi possivel excluir o evento.'));
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);

    if (!file) {
      this.previewUrl.set(this.eventForm.controls.imagem.value || null);
      return;
    }

    this.previewUrl.set(URL.createObjectURL(file));
  }

  openFile(fileName: string): void {
    this.arquivosAdminService
      .downloadArquivo(fileName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = fileName;
          anchor.click();
          URL.revokeObjectURL(url);
        },
      });
  }

  badgeTone(evento: EventoAdminVm): string {
    switch (evento.estado) {
      case 'past':
        return 'secondary';
      case 'today':
        return 'warning';
      default:
        return 'success';
    }
  }
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error.trim();
    }

    if (error.status === 0) {
      return 'Nao foi possivel conectar na API. Verifique se o backend esta ativo.';
    }
  }

  return fallback;
}
