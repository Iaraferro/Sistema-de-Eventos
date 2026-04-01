import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { mapApiUsuarioResponseToVm } from '../mappers/usuario-admin.mapper';
import { ApiAuthCredentials } from '../models/api-auth-credentials.model';
import { ApiUsuarioResponse } from '../models/api-usuario-response.model';
import { UsuarioAdminVm } from '../models/usuario-admin-vm.model';
import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiClient = inject(ApiClientService);
  private readonly router = inject(Router);

  login(credentials: ApiAuthCredentials): Observable<string> {
    return this.apiClient.postText('/auth', credentials).pipe(
      map((token) => {
        const normalized = (token ?? '').trim();

        if (!normalized) {
          throw new Error('Credenciais inválidas.');
        }

        return normalized;
      }),
      tap((token) => this.apiClient.setToken(token)),
    );
  }

  logout(redirect = true): void {
    this.apiClient.clearToken();

    if (redirect) {
      void this.router.navigateByUrl('/admin/acesso');
    }
  }

  getToken(): string | null {
    return this.apiClient.getToken();
  }

  isAuthenticated(): boolean {
    const payload = this.getTokenPayload();
    if (!payload) {
      return false;
    }

    const expiresAt = payload.exp;
    if (typeof expiresAt === 'number' && Date.now() >= expiresAt * 1000) {
      this.logout(false);
      return false;
    }

    return true;
  }

  hasAdminSession(): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    return this.getTokenGroups().includes('ADM');
  }

  getProfile(): Observable<ApiUsuarioResponse> {
    return this.apiClient.get<ApiUsuarioResponse>('/usuarios/perfil', { auth: true });
  }

  getProfileVm(): Observable<UsuarioAdminVm> {
    return this.getProfile().pipe(map(mapApiUsuarioResponseToVm));
  }

  private getTokenPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const segments = token.split('.');
    if (segments.length < 2) {
      return null;
    }

    try {
      const normalizedPayload = segments[1].replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '=',
      );

      return JSON.parse(atob(paddedPayload)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private getTokenGroups(): string[] {
    const groups = this.getTokenPayload()?.groups;

    if (Array.isArray(groups)) {
      return groups.filter((value): value is string => typeof value === 'string');
    }

    if (typeof groups === 'string' && groups.trim()) {
      return [groups.trim()];
    }

    return [];
  }
}

interface JwtPayload {
  exp?: number;
  groups?: string[] | string;
}
