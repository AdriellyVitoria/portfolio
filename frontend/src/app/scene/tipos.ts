import type { Object3D } from 'three';

import type { CategoriaSkill, PainelCafe } from '../core/models';

/** O que um objeto clicável da cena representa. Fica em `mesh.userData.alvo`. */
export type AlvoInterativo =
  | { tipo: 'projeto'; id: string; rotulo: string }
  /** Um vaso da floricultura = uma categoria de skills. */
  | { tipo: 'categoria'; id: CategoriaSkill; rotulo: string }
  | { tipo: 'cafe'; id: PainelCafe; rotulo: string }
  | { tipo: 'aurora'; id: 'aurora'; rotulo: string };

/** Contrato comum das partes da cena (ambiente, livraria, floricultura...). */
export interface ParteCena {
  readonly grupo: Object3D;
  /** Chamado a cada frame. `dt` e `tempo` em segundos. */
  update(dt: number, tempo: number): void;
}

export function alvoDe(objeto: Object3D | undefined): AlvoInterativo | undefined {
  return objeto?.userData['alvo'] as AlvoInterativo | undefined;
}
