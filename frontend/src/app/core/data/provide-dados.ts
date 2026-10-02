import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { PerfilMockRepository } from './mock/perfil-mock.repository';
import { ProjetoMockRepository } from './mock/projeto-mock.repository';
import { SkillMockRepository } from './mock/skill-mock.repository';
import { LATENCIA_MOCK_MS } from './mock/latencia-mock';
import { PerfilRepository } from './perfil.repository';
import { ProjetoRepository } from './projeto.repository';
import { SkillRepository } from './skill.repository';

export type FonteDados = 'mock' | 'http';

export interface OpcoesDados {
  fonte: FonteDados;
  latenciaMockMs?: number;
}

/**
 * Único ponto onde se escolhe de onde vêm os dados.
 * Componentes e serviços dependem só das classes abstratas.
 */
export function provideDados({ fonte, latenciaMockMs = 0 }: OpcoesDados): EnvironmentProviders {
  if (fonte === 'http') {
    throw new Error('Repositories HTTP ainda não existem: chegam com o backend.');
  }

  return makeEnvironmentProviders([
    { provide: LATENCIA_MOCK_MS, useValue: latenciaMockMs },
    { provide: ProjetoRepository, useClass: ProjetoMockRepository },
    { provide: SkillRepository, useClass: SkillMockRepository },
    { provide: PerfilRepository, useClass: PerfilMockRepository },
  ]);
}
