import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { resolveApiErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-admin-access-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-access-page.component.html',
  styleUrl: './admin-access-page.component.css',
})
export class AdminAccessPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loginPending = signal(false);
  readonly loginFeedback = signal<string | null>(null);
  readonly loginAlertTone = signal<'success' | 'danger' | 'info'>('info');

  readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['admin', [Validators.required, Validators.minLength(4)]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.loginAlertTone.set('danger');
      this.loginFeedback.set(buildLoginValidationMessage(this.loginForm.getRawValue()));
      return;
    }

    this.loginPending.set(true);
    this.loginFeedback.set(null);

    const credentials = {
      username: this.loginForm.controls.username.value.trim(),
      senha: this.loginForm.controls.senha.value,
    };

    this.authService
      .login(credentials)
      .pipe(
        finalize(() => this.loginPending.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.loginAlertTone.set('success');
          this.loginFeedback.set('Acesso administrativo realizado com sucesso.');
          void this.router.navigateByUrl('/admin/dashboard');
        },
        error: (error) => {
          this.loginAlertTone.set('danger');
          this.loginFeedback.set(
            resolveApiErrorMessage(error, 'Nao foi possivel realizar o login.'),
          );
        },
      });
  }
}

function buildLoginValidationMessage(formValue: { username: string; senha: string }): string {
  const issues: string[] = [];

  if (!formValue.username.trim()) {
    issues.push('informe o usuario');
  }

  if (!formValue.senha) {
    issues.push('informe a senha');
  } else if (formValue.senha.length < 6) {
    issues.push('a senha deve ter pelo menos 6 caracteres');
  }

  if (!issues.length) {
    return 'Revise os dados do login e tente novamente.';
  }

  return `Nao foi possivel enviar o login: ${issues.join(', ')}.`;
}
