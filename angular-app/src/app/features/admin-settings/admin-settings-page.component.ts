import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { UsuarioAdminFormModel } from '../../core/models/usuario-admin-form.model';
import { UsuarioAdminVm } from '../../core/models/usuario-admin-vm.model';
import { ApiClientService } from '../../core/services/api-client.service';
import { AuthDevService } from '../../core/services/auth-dev.service';
import { UsuariosAdminService } from '../../core/services/usuarios-admin.service';
import { resolveApiErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-admin-settings-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-settings-page.component.html',
  styleUrl: './admin-settings-page.component.css'
})
export class AdminSettingsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiClientService = inject(ApiClientService);
  private readonly authDevService = inject(AuthDevService);
  private readonly usuariosAdminService = inject(UsuariosAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly saveFeedback = signal<string | null>(null);
  readonly saveAlertTone = signal<'success' | 'danger' | 'info'>('info');
  readonly registerPending = signal(false);
  readonly registerFeedback = signal<string | null>(null);
  readonly registerAlertTone = signal<'success' | 'danger' | 'info'>('info');
  readonly profile = signal<UsuarioAdminVm | null>(null);

  readonly settingsForm = this.formBuilder.nonNullable.group({
    alertasEmail: [true],
    avisarNovosEventos: [true],
    avisarParticipantes: [false],
    timezone: ['America/Araguaina', Validators.required],
    idioma: ['pt-BR', Validators.required],
    formatoData: ['DD/MM/AAAA', Validators.required]
  });

  readonly registerForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.minLength(4)]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    idPerfil: [1]
  });

  constructor() {
    this.authDevService
      .getPerfilDevVm()
      .pipe(
        catchError(() => of<UsuarioAdminVm | null>(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((profile) => this.profile.set(profile));
  }

  savePreferences(): void {
    this.saveAlertTone.set('info');
    this.saveFeedback.set(
      'Preferencias salvas apenas no cliente nesta etapa. A persistencia final entra depois da validacao manual.'
    );
  }

  registerAdmin(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.registerAlertTone.set('danger');
      this.registerFeedback.set(buildRegisterValidationMessage(this.registerForm.getRawValue()));
      return;
    }

    this.registerPending.set(true);
    this.registerFeedback.set(null);

    const raw = this.registerForm.getRawValue();
    const fallbackUsername = raw.email.trim();
    const username = (raw.username?.trim() || fallbackUsername).trim();

    const payload: UsuarioAdminFormModel = {
      nome: raw.nome.trim(),
      email: raw.email.trim(),
      username,
      senha: raw.senha,
      idPerfil: 1
    };

    this.usuariosAdminService
      .createUsuario(payload)
      .pipe(
        finalize(() => this.registerPending.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (usuario) => {
          this.registerAlertTone.set('success');
          this.registerFeedback.set(`Administrador ${usuario.username} cadastrado com sucesso.`);
          this.registerForm.reset({
            nome: '',
            email: '',
            username: '',
            senha: '',
            idPerfil: 1
          });
        },
        error: (error) => {
          this.registerAlertTone.set('danger');
          this.registerFeedback.set(
            resolveApiErrorMessage(error, 'Nao foi possivel cadastrar o administrador.')
          );
        }
      });
  }

  apiBaseUrl(): string {
    return this.apiClientService.getBaseUrl();
  }

  tokenAtivo(): string {
    return this.authDevService.getToken() ? 'sim' : 'nao';
  }
}

function buildRegisterValidationMessage(formValue: UsuarioAdminFormModel): string {
  const issues: string[] = [];

  if (!formValue.nome.trim()) {
    issues.push('informe o nome');
  } else if (formValue.nome.trim().length < 3) {
    issues.push('o nome deve ter pelo menos 3 caracteres');
  }

  if (!formValue.email.trim()) {
    issues.push('informe o e-mail');
  } else if (!formValue.email.includes('@')) {
    issues.push('informe um e-mail valido');
  }

  if (formValue.username.trim() && formValue.username.trim().length < 4) {
    issues.push('o username deve ter pelo menos 4 caracteres');
  }

  if (!formValue.senha) {
    issues.push('informe a senha');
  } else if (formValue.senha.length < 6) {
    issues.push('a senha deve ter pelo menos 6 caracteres');
  }

  if (!issues.length) {
    return 'Revise os dados do cadastro e tente novamente.';
  }

  return `Nao foi possivel enviar o cadastro: ${issues.join(', ')}.`;
}
