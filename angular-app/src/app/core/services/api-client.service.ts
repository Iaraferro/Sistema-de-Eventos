import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiRequestOptions {
  auth?: boolean;
  headers?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly tokenStorageKey = 'jwtToken';
  private readonly legacyTokenStorageKey = 'ecoeventos-admin-dev-token';

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getToken(): string | null {
    const currentToken = localStorage.getItem(this.tokenStorageKey);
    if (currentToken) {
      return currentToken;
    }

    const legacyToken = localStorage.getItem(this.legacyTokenStorageKey);
    if (legacyToken) {
      localStorage.setItem(this.tokenStorageKey, legacyToken);
      localStorage.removeItem(this.legacyTokenStorageKey);
    }

    return legacyToken;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenStorageKey, token);
    localStorage.removeItem(this.legacyTokenStorageKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.legacyTokenStorageKey);
  }

  get<T>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.handleRequest(
      this.http.get<T>(this.buildUrl(path), { headers: this.buildHeaders(options) }),
      options
    );
  }

  getUnknown(path: string, options: ApiRequestOptions = {}): Observable<unknown> {
    return this.handleRequest(
      this.http.get<unknown>(this.buildUrl(path), { headers: this.buildHeaders(options) }),
      options
    );
  }

  getBlob(path: string, options: ApiRequestOptions = {}): Observable<Blob> {
    return this.handleRequest(
      this.http.get(this.buildUrl(path), {
        headers: this.buildHeaders(options),
        responseType: 'blob'
      }),
      options
    );
  }

  post<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.handleRequest(
      this.http.post<T>(this.buildUrl(path), body, {
        headers: this.buildHeaders(options, body)
      }),
      options
    );
  }

  postText(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<string> {
    return this.handleRequest(
      this.http.post(this.buildUrl(path), body, {
        headers: this.buildHeaders(options, body),
        responseType: 'text'
      }),
      options
    );
  }

  upload<T>(path: string, formData: FormData, options: ApiRequestOptions = {}): Observable<T> {
    return this.handleRequest(
      this.http.post<T>(this.buildUrl(path), formData, {
        headers: this.buildHeaders(options)
      }),
      options
    );
  }

  put<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.handleRequest(
      this.http.put<T>(this.buildUrl(path), body, {
        headers: this.buildHeaders(options, body)
      }),
      options
    );
  }

  delete<T>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.handleRequest(
      this.http.delete<T>(this.buildUrl(path), {
        headers: this.buildHeaders(options)
      }),
      options
    );
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private buildHeaders(options: ApiRequestOptions, body?: unknown): HttpHeaders {
    const headers: Record<string, string> = { ...(options.headers ?? {}) };

    if (body !== undefined && !(body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
    }

    if (options.auth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return new HttpHeaders(headers);
  }

  private handleRequest<T>(request$: Observable<T>, options: ApiRequestOptions): Observable<T> {
    return request$.pipe(
      catchError((error: unknown) => {
        if (
          options.auth &&
          error instanceof HttpErrorResponse &&
          (error.status === 401 || error.status === 403)
        ) {
          this.clearToken();
          void this.router.navigateByUrl('/admin/acesso');
        }

        return throwError(() => error);
      })
    );
  }
}
