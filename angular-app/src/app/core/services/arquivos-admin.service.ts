import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiArquivoEvento } from '../models/api-arquivo-evento.model';
import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class ArquivosAdminService {
  private readonly apiClient = inject(ApiClientService);

  uploadArquivo(arquivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('nomeArquivo', arquivo.name);

    return this.apiClient.postText('/arquivos/upload', formData, { auth: true });
  }

  uploadArquivoEvento(idEvento: number, arquivo: File): Observable<ApiArquivoEvento> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('nomeArquivo', arquivo.name);
    formData.append('idEvento', String(idEvento));

    return this.apiClient.upload<ApiArquivoEvento>(`/eventos/${idEvento}/arquivos`, formData, {
      auth: true,
    });
  }

  downloadArquivo(nomeArquivo: string): Observable<Blob> {
    return this.apiClient.getBlob(`/arquivos/${encodeURIComponent(nomeArquivo)}`);
  }

  resolveArquivoUrl(nomeArquivo: string): string {
    const baseUrl = this.apiClient.getBaseUrl();
    const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalized}/arquivos/${encodeURIComponent(nomeArquivo)}`;
  }
}
