import {
  type BufferGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  Shape,
  ShapeGeometry,
  Vector2,
} from 'three';

import { PALETA } from '../paleta';
import type { ParteCena } from '../tipos';

// zMax fica longe da câmera da entrada (z = 11): folha colada na lente vira um borrão.
const AREA = { xMin: -8, xMax: 8, zMin: 4.4, zMax: 9, yTopo: 6 };
/** Onde ficam as folhas já caídas: a rua e um pouco da entrada da loja. */
const CHAO = { xMin: -8, xMax: 8, zMin: 3.2, zMax: 10.5 };
const CORES = [
  PALETA.amarelo,
  PALETA.laranja,
  PALETA.terracota,
  0xa63a24, // vermelho de outono
  0xd98b2b,
  PALETA.marrom,
];
/** As que caem são mais vivas (marrom escuro vira silhueta preta contra o céu). */
const CORES_CAINDO = [PALETA.amarelo, PALETA.laranja, PALETA.terracota, 0xc8452a, 0xd98b2b];
const TAMANHO_FOLHA = 0.17; // metros

interface Folha {
  /** Posição "de base"; o balanço lateral é somado em cima dela. */
  x: number;
  y: number;
  z: number;
  velocidade: number;
  fase: number;
  balanco: number;
  giro: number;
  escala: number;
}

/**
 * Silhueta de folha de bordo: cinco pontas com borda serrilhada e um cabinho.
 * Gerada por uma função polar (raio varia com o ângulo), com leve curvatura para
 * a folha não parecer papel chato.
 */
export function geometriaFolhaDeBordo(): BufferGeometry {
  const pontos: Vector2[] = [];
  const passos = 90;
  for (let i = 0; i <= passos; i++) {
    const angulo = (i / passos) * Math.PI * 2; // 0 = para cima
    const desvio = Math.atan2(Math.sin(angulo), Math.cos(angulo)); // -π..π a partir do topo
    let raio: number;
    if (Math.abs(desvio) > MathUtils.degToRad(150)) {
      raio = 0.18; // base, junto do cabinho
    } else {
      const lobos = Math.abs(Math.cos(2.5 * desvio)) ** 1.6; // pontas em 0°, ±72° e ±144°
      const serrilhado = Math.abs(Math.sin(14 * desvio)) * 0.06;
      raio = 0.4 + 0.6 * lobos + serrilhado;
    }
    pontos.push(new Vector2(Math.sin(angulo) * raio * 0.5, Math.cos(angulo) * raio * 0.5));
  }
  const forma = new Shape(pontos);
  // Cabinho.
  const cabinho = new Shape([
    new Vector2(-0.015, -0.08),
    new Vector2(0.015, -0.08),
    new Vector2(0.02, -0.28),
    new Vector2(-0.005, -0.28),
  ]);
  const geometria = new ShapeGeometry([forma, cabinho]);

  // Curvatura suave: as bordas sobem um pouco, como folha seca.
  const posicoes = geometria.attributes['position'];
  for (let i = 0; i < posicoes.count; i++) {
    const x = posicoes.getX(i);
    const y = posicoes.getY(i);
    posicoes.setZ(i, (x * x + y * y * 0.4) * 0.6);
  }
  geometria.scale(TAMANHO_FOLHA, TAMANHO_FOLHA, TAMANHO_FOLHA);
  geometria.computeVertexNormals();
  return geometria;
}

/**
 * Folhas de bordo caindo na rua (balançando como pêndulo, levadas pelo vento) e uma
 * camada de folhas já caídas nos paralelepípedos. Cada grupo é um único InstancedMesh:
 * a GPU desenha centenas de folhas em uma chamada só.
 * Com movimento reduzido, ficam só as do chão.
 */
export class Folhas implements ParteCena {
  readonly grupo = new Group();
  private readonly caindo?: InstancedMesh;
  private readonly folhas: Folha[] = [];
  private readonly auxiliar = new Object3D();

  constructor(quantidade: number, paradas: boolean) {
    this.grupo.name = 'folhas';
    const geometria = geometriaFolhaDeBordo();
    const material = new MeshStandardMaterial({ side: DoubleSide, roughness: 0.85 });
    const cor = new Color();

    // Folhas no chão (estáticas).
    const noChao = new InstancedMesh(geometria, material, Math.round(quantidade * 0.6));
    for (let i = 0; i < noChao.count; i++) {
      this.auxiliar.position.set(
        CHAO.xMin + Math.random() * (CHAO.xMax - CHAO.xMin),
        0.03 + Math.random() * 0.01,
        CHAO.zMin + Math.random() * (CHAO.zMax - CHAO.zMin),
      );
      this.auxiliar.rotation.set(
        -Math.PI / 2 + (Math.random() - 0.5) * 0.3,
        0,
        Math.random() * Math.PI * 2,
      );
      this.auxiliar.scale.setScalar(0.8 + Math.random() * 0.5);
      this.auxiliar.updateMatrix();
      noChao.setMatrixAt(i, this.auxiliar.matrix);
      noChao.setColorAt(i, cor.setHex(CORES[i % CORES.length]).multiplyScalar(0.85));
    }
    noChao.receiveShadow = true;
    this.grupo.add(noChao);

    if (paradas) return;

    // Folhas caindo.
    // Um leve brilho quente: contraluz, a folha continua colorida em vez de escura.
    const materialCaindo = new MeshStandardMaterial({
      side: DoubleSide,
      roughness: 0.85,
      emissive: 0x6a2c0c,
      emissiveIntensity: 0.55,
    });
    this.caindo = new InstancedMesh(geometria, materialCaindo, quantidade);
    for (let i = 0; i < quantidade; i++) {
      this.folhas.push(this.nova(Math.random() * AREA.yTopo));
      this.caindo.setColorAt(i, cor.setHex(CORES_CAINDO[(i * 3) % CORES_CAINDO.length]));
    }
    this.grupo.add(this.caindo);
    this.aplicar(0);
  }

  /** Menos folhas caindo (qualidade mais baixa). Só diminui: as instâncias já existem. */
  limitar(quantidade: number): void {
    if (!this.caindo) return;
    this.caindo.count = Math.min(quantidade, this.folhas.length);
  }

  update(dt: number, tempo: number): void {
    if (!this.caindo) return;
    for (let i = 0; i < this.caindo.count; i++) {
      const folha = this.folhas[i];
      folha.y -= folha.velocidade * dt;
      folha.x += 0.18 * dt; // vento leve, sempre para o mesmo lado
      if (folha.y < 0.05) {
        Object.assign(folha, this.nova(AREA.yTopo));
      }
    }
    this.aplicar(tempo);
  }

  private nova(y: number): Folha {
    return {
      x: AREA.xMin - 1 + Math.random() * (AREA.xMax - AREA.xMin),
      y,
      z: AREA.zMin + Math.random() * (AREA.zMax - AREA.zMin),
      velocidade: 0.28 + Math.random() * 0.3,
      fase: Math.random() * Math.PI * 2,
      balanco: 1.1 + Math.random() * 0.8,
      giro: (Math.random() - 0.5) * 1.2,
      escala: 0.8 + Math.random() * 0.5,
    };
  }

  /** Queda de folha de verdade: balança de um lado para o outro e inclina junto. */
  private aplicar(tempo: number): void {
    if (!this.caindo) return;
    for (let i = 0; i < this.caindo.count; i++) {
      const folha = this.folhas[i];
      const onda = Math.sin(tempo * folha.balanco + folha.fase);
      this.auxiliar.position.set(folha.x + onda * 0.35, folha.y, folha.z);
      this.auxiliar.rotation.set(
        -Math.PI / 2 + 0.5 + Math.cos(tempo * folha.balanco + folha.fase) * 0.3,
        tempo * folha.giro + folha.fase,
        onda * 0.7,
        'YXZ',
      );
      this.auxiliar.scale.setScalar(folha.escala);
      this.auxiliar.updateMatrix();
      this.caindo.setMatrixAt(i, this.auxiliar.matrix);
    }
    this.caindo.instanceMatrix.needsUpdate = true;
  }
}
