import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom } from 'rxjs';

import { ProjetoRepository } from './core/data/projeto.repository';

export const serverRoutes: ServerRoute[] = [
  {
    // Uma página estática por projeto: link compartilhável e indexável.
    path: 'simples/projetos/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const projetos = await firstValueFrom(inject(ProjetoRepository).listar());
      return projetos.map(({ id }) => ({ id }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
