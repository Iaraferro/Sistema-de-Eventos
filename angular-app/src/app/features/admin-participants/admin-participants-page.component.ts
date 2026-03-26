import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { UsuarioAdminVm } from '../../core/models/usuario-admin-vm.model';
import { UsuariosAdminService } from '../../core/services/usuarios-admin.service';

@Component({
  selector: 'app-admin-participants-page',
  templateUrl: './admin-participants-page.component.html',
  styleUrl: './admin-participants-page.component.css'
})
export class AdminParticipantsPageComponent {
  private readonly usuariosAdminService = inject(UsuariosAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly usuarios = signal<UsuarioAdminVm[]>([]);

  readonly filteredParticipants = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const usuarios = this.usuarios();

    if (!query) {
      return usuarios;
    }

    return usuarios.filter((usuario) =>
      [usuario.username, usuario.email, usuario.perfilNome]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  });

  readonly totalUsuarios = computed(() => this.usuarios().length);
  readonly totalAdmins = computed(() => this.usuarios().filter((usuario) => usuario.isAdmin).length);
  readonly totalOperacao = computed(
    () => this.usuarios().filter((usuario) => !usuario.isAdmin).length
  );

  constructor() {
    this.loadUsuarios();
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
  }

  reload(): void {
    this.loadUsuarios();
  }

  badgeTone(usuario: UsuarioAdminVm): string {
    return usuario.isAdmin ? 'success' : 'secondary';
  }

  badgeLabel(usuario: UsuarioAdminVm): string {
    return usuario.isAdmin ? 'Admin' : 'Operação';
  }

  private loadUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usuariosAdminService
      .listUsuariosVm()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (usuarios) => this.usuarios.set(usuarios),
        error: () => {
          this.error.set(
            'Não foi possível carregar os usuários usados como referência operacional.'
          );
        }
      });
  }
}
