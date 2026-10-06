import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { ChatRepository } from './chat.repository';
import { ChatLocalRepository } from './local/chat-local.repository';
import { PerfilLocalRepository } from './local/perfil-local.repository';
import { ProjetoLocalRepository } from './local/projeto-local.repository';
import { SkillLocalRepository } from './local/skill-local.repository';
import { LATENCIA_SIMULADA_MS } from './local/latencia';
import { PerfilRepository } from './perfil.repository';
import { ProjetoRepository } from './projeto.repository';
import { SkillRepository } from './skill.repository';

/**
 * `local`: os dados reais do portfólio, versionados no próprio front (`local/*.dados.ts`).
 * `http`: a API do backend, quando existir.
 */
export type FonteDados = 'local' | 'http';

export interface OpcoesDados {
  fonte: FonteDados;
  latenciaSimuladaMs?: number;
}

/**
 * Único ponto onde se escolhe de onde vêm os dados.
 * Componentes e serviços dependem só das classes abstratas.
 */
export function provideDados({ fonte, latenciaSimuladaMs = 0 }: OpcoesDados): EnvironmentProviders {
  if (fonte === 'http') {
    throw new Error('Repositories HTTP ainda não existem: chegam com o backend.');
  }

  return makeEnvironmentProviders([
    { provide: LATENCIA_SIMULADA_MS, useValue: latenciaSimuladaMs },
    { provide: ProjetoRepository, useClass: ProjetoLocalRepository },
    { provide: SkillRepository, useClass: SkillLocalRepository },
    { provide: PerfilRepository, useClass: PerfilLocalRepository },
    { provide: ChatRepository, useClass: ChatLocalRepository },
  ]);
}
