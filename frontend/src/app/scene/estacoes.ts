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
export interface Estacao {
  area: Area;
  posicao: Vector3;
  alvo: Vector3;
}

export const ESTACOES: Record<Area, Estacao> = {
  entrada: { area: 'entrada', posicao: new Vector3(0, 2.0, 11), alvo: new Vector3(0, 1.5, 0) },
  livraria: {
    area: 'livraria',
    posicao: new Vector3(-4.3, 1.75, -0.9),
    alvo: new Vector3(-5.2, 1.4, -4.8),
  },
  floricultura: {
    area: 'floricultura',
    posicao: new Vector3(0, 2.6, 1.7),
    alvo: new Vector3(0, 1.15, -3.6),
  },
  cafe: { area: 'cafe', posicao: new Vector3(3.9, 1.8, 1.2), alvo: new Vector3(4.9, 0.85, -2.2) },
  // A Aurora fica atrás do balcão do café.
  aurora: {
    area: 'aurora',
    posicao: new Vector3(4.4, 1.7, -0.6),
    alvo: new Vector3(5.4, 1.3, -3.9),
  },
};
