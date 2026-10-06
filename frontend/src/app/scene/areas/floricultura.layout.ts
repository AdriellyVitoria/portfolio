import { Vector3 } from 'three';

import type { CategoriaSkill } from '../../core/models';

/** De que lado da floricultura o vaso fica (e, com ele, para onde a etiqueta aponta). */
export type LadoCanteiro = 'esquerda' | 'direita' | 'centro';

export interface PosicaoCanteiro {
  categoria: CategoriaSkill;
  lado: LadoCanteiro;
  /** Base do vaso (coordenadas do mundo). */
  base: Vector3;
  escala: number;
  /** Andar na estante (0 = de baixo); o vaso central não tem. */
  andar?: number;
}

/** Categoria que vai para o vaso central, em destaque (IA é um diferencial). */
export const CATEGORIA_DESTAQUE: CategoriaSkill = 'IA';

export const ESTANTE = {
  x: 1.6, // distância do centro até cada estante
  z: -3.55,
  largura: 0.8,
  profundidade: 0.5,
  alturaAndar: 0.78,
  basePrimeiroAndar: 0.06,
  escalaVaso: 0.72,
} as const;

export const CENTRO = { x: 0, z: -3.25, alturaCaixote: 0.35, escalaVaso: 1.15 } as const;

/**
 * Distribui as categorias: a de destaque no centro, as outras divididas entre
 * duas estantes (metade à esquerda, metade à direita), de cima para baixo na
 * ordem do currículo. Sem a categoria de destaque, sobra uma ímpar para o centro.
 */
export function disporCanteiros(categorias: readonly CategoriaSkill[]): PosicaoCanteiro[] {
  if (!categorias.length) return [];

  const destaque = categorias.includes(CATEGORIA_DESTAQUE)
    ? CATEGORIA_DESTAQUE
    : categorias.length % 2 === 1
      ? categorias[categorias.length - 1]
      : undefined;
  const laterais = categorias.filter((c) => c !== destaque);
  const metade = Math.ceil(laterais.length / 2);
  const lados: [LadoCanteiro, CategoriaSkill[]][] = [
    ['esquerda', laterais.slice(0, metade)],
    ['direita', laterais.slice(metade)],
  ];
  const andares = Math.max(metade, 1);

  const posicoes: PosicaoCanteiro[] = [];
  for (const [lado, grupo] of lados) {
    const x = lado === 'esquerda' ? -ESTANTE.x : ESTANTE.x;
    grupo.forEach((categoria, i) => {
      const andar = andares - 1 - i; // a primeira categoria fica no andar de cima
      posicoes.push({
        categoria,
        lado,
        andar,
        escala: ESTANTE.escalaVaso,
        base: new Vector3(x, ESTANTE.basePrimeiroAndar + andar * ESTANTE.alturaAndar, ESTANTE.z),
      });
    });
  }
  if (destaque) {
    posicoes.push({
      categoria: destaque,
      lado: 'centro',
      escala: CENTRO.escalaVaso,
      base: new Vector3(CENTRO.x, CENTRO.alturaCaixote, CENTRO.z),
    });
  }
  return posicoes;
}

/** Quantos andares cada estante precisa. */
export function andaresDaEstante(posicoes: readonly PosicaoCanteiro[]): number {
  return Math.max(0, ...posicoes.map((p) => (p.andar ?? -1) + 1));
}
