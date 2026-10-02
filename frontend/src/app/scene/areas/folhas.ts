import {
  Color,
  DoubleSide,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
} from 'three';

import { PALETA } from '../paleta';
import type { ParteCena } from '../tipos';

// zMax fica longe da câmera da entrada (z = 11): folha colada na lente vira um borrão.
const AREA = { xMin: -8, xMax: 8, zMin: 4.4, zMax: 9, yTopo: 6 };
const CORES = [PALETA.laranja, PALETA.terracota, PALETA.amarelo, PALETA.marrom, 0xc9622f];

interface Folha {
  x: number;
  y: number;
  z: number;
  velocidade: number;
  fase: number;
  giro: number;
}

/**
 * Folhas de outono caindo na rua. Todas as folhas são instâncias de um único mesh:
 * a GPU desenha centenas delas numa chamada só.
 */
export class Folhas implements ParteCena {
  readonly grupo: InstancedMesh;
  private readonly folhas: Folha[] = [];
  private readonly auxiliar = new Object3D();

  constructor(
    quantidade: number,
    private readonly paradas: boolean,
  ) {
    this.grupo = new InstancedMesh(
      new PlaneGeometry(0.14, 0.09),
      new MeshStandardMaterial({ side: DoubleSide, roughness: 0.9 }),
      quantidade,
    );
    this.grupo.name = 'folhas';
    const cor = new Color();
    for (let i = 0; i < quantidade; i++) {
      this.folhas.push(this.nova(Math.random() * AREA.yTopo));
      this.grupo.setColorAt(i, cor.setHex(CORES[i % CORES.length]));
    }
    if (paradas) {
      // Movimento reduzido: as folhas ficam espalhadas no chão.
      this.folhas.forEach((f) => (f.y = 0.01));
    }
    this.aplicar(0);
  }

  update(dt: number, tempo: number): void {
    if (this.paradas) return;
    for (const folha of this.folhas) {
      folha.y -= folha.velocidade * dt;
      folha.x += Math.sin(tempo * 0.8 + folha.fase) * 0.25 * dt; // vento
      if (folha.y < 0) {
        Object.assign(folha, this.nova(AREA.yTopo));
      }
    }
    this.aplicar(tempo);
  }

  private nova(y: number): Folha {
    return {
      x: AREA.xMin + Math.random() * (AREA.xMax - AREA.xMin),
      y,
      z: AREA.zMin + Math.random() * (AREA.zMax - AREA.zMin),
      velocidade: 0.35 + Math.random() * 0.45,
      fase: Math.random() * Math.PI * 2,
      giro: 0.8 + Math.random() * 1.6,
    };
  }

  private aplicar(tempo: number): void {
    this.folhas.forEach((folha, i) => {
      this.auxiliar.position.set(folha.x, folha.y, folha.z);
      if (this.paradas) {
        this.auxiliar.rotation.set(-Math.PI / 2, 0, folha.fase);
      } else {
        this.auxiliar.rotation.set(
          tempo * folha.giro + folha.fase,
          folha.fase,
          tempo * folha.giro * 0.6,
        );
      }
      this.auxiliar.updateMatrix();
      this.grupo.setMatrixAt(i, this.auxiliar.matrix);
    });
    this.grupo.instanceMatrix.needsUpdate = true;
  }
}
