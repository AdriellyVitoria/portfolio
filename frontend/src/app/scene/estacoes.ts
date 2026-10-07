import { Vector3 } from 'three';

import type { Area } from '../core/models';

/**
 * Onde a câmera fica em cada área e para onde olha.
 *
 * Planta da cena (metros, vista de cima):
 *   z = -5  parede do fundo
 *           livraria (x≈-5) · floricultura (x≈0) · café (x≈+5)
 *   z = +4  fachada com a porta (x entre -1.3 e 1.3)
 *   z > +4  rua de paralelepípedos (estação "entrada")
 */
export interface Enquadramento {
  posicao: Vector3;
  alvo: Vector3;
}

export interface Estacao extends Enquadramento {
  area: Area;
  /** Enquadramento para tela em pé (celular), quando o normal não cabe. */
  retrato?: Enquadramento;
}

export const ESTACOES: Record<Area, Estacao> = {
  entrada: { area: 'entrada', posicao: new Vector3(0, 2.0, 11), alvo: new Vector3(0, 1.5, 0) },
  livraria: {
    area: 'livraria',
    posicao: new Vector3(-4.2, 1.85, -0.2),
    alvo: new Vector3(-5.2, 1.6, -4.8),
  },
  floricultura: {
    area: 'floricultura',
    posicao: new Vector3(0, 1.95, 1.5),
    alvo: new Vector3(0, 1.1, -2.9),
    // Em pé, a tela é estreita: a câmera recua para as duas estantes caberem, e o alvo
    // fica mais baixo para os vasos subirem acima do painel do rodapé.
    retrato: { posicao: new Vector3(0, 2.1, 3.3), alvo: new Vector3(0, 0.75, -3.4) },
  },
  cafe: { area: 'cafe', posicao: new Vector3(3.9, 1.85, 1.4), alvo: new Vector3(4.9, 1.05, -2.2) },
  // A Aurora fica atrás do balcão do café.
  aurora: {
    area: 'aurora',
    // Enquadra o tablet à esquerda; à direita fica o painel do chat.
    posicao: new Vector3(4.55, 1.75, -1.75),
    alvo: new Vector3(5.45, 1.25, -3.85),
  },
};
