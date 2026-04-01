import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  mapApiUsuarioResponseListToVmList,
  mapUsuarioFormToApiUsuario,
} from '../mappers/usuario-admin.mapper';
import { ApiUsuarioResponse } from '../models/api-usuario-response.model';
import { UsuarioAdminFormModel } from '../models/usuario-admin-form.model';
import { UsuarioAdminVm } from '../models/usuario-admin-vm.model';
import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
  private readonly apiClient = inject(ApiClientService);

  listUsuarios(): Observable<ApiUsuarioResponse[]> {
    return this.apiClient
      .getUnknown('/usuarios', { auth: true })
      .pipe(map((response) => normalizeUsuarioListResponse(response)));
  }

  listUsuariosVm(): Observable<UsuarioAdminVm[]> {
    return this.listUsuarios().pipe(map(mapApiUsuarioResponseListToVmList));
  }

  createUsuario(form: UsuarioAdminFormModel): Observable<ApiUsuarioResponse> {
    return this.apiClient.post<ApiUsuarioResponse>('/usuarios', mapUsuarioFormToApiUsuario(form), {
      auth: true,
    });
  }
}

function normalizeUsuarioListResponse(response: unknown): ApiUsuarioResponse[] {
  if (Array.isArray(response)) {
    return response as ApiUsuarioResponse[];
  }

  if (isRecord(response)) {
    const candidateKeys = ['usuarios', 'content', 'data', 'items', 'result', 'results', 'records'];

    for (const key of candidateKeys) {
      const value = response[key];
      if (Array.isArray(value)) {
        return value as ApiUsuarioResponse[];
      }
    }
  }

  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
