import { HttpErrorResponse } from '@angular/common/http';

export function resolveApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error.trim();
    }

    if (error.status === 0) {
      return 'Nao foi possivel conectar na API. Verifique se o backend esta ativo.';
    }

    if (error.status === 400) {
      return 'Os dados enviados sao invalidos. Revise os campos obrigatorios e tente novamente.';
    }

    if (error.status === 401) {
      return 'Usuario ou senha invalidos. Confira as credenciais e tente novamente.';
    }

    if (error.status === 403) {
      return 'Seu perfil nao possui permissao para executar esta acao.';
    }

    if (error.status === 404) {
      return 'O recurso solicitado nao foi encontrado.';
    }

    if (error.status >= 500) {
      return 'O servidor encontrou um erro interno ao processar a solicitacao.';
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}
