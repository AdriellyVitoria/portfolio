import { MathUtils, type PerspectiveCamera, Vector3 } from 'three';

import type { Area } from '../core/models';

/**
 * Onde o rótulo encosta no ponto 3D: pela base (ponteiro para baixo), pelo topo (placa
 * pendurada), pelo centro, ou de lado: `direita` = o rótulo fica à esquerda do ponto e
 * encosta nele pela borda direita; `esquerda` = o contrário.
 */
export type Alinhamento = 'base' | 'topo' | 'centro' | 'esquerda' | 'direita';

/** Ponto do mundo 3D onde um rótulo HTML fica preso. Definido pelas partes da cena. */
export interface AncoraRotulo {
  id: string;
  posicao: Vector3;
  alinhamento: Alinhamento;
  /** Estações em que o rótulo aparece (HTML não é escondido por paredes como o 3D). */
  areas: readonly Area[];
  /** Distância (m) em que o rótulo aparece no tamanho natural; mais longe, encolhe. */
  distanciaReferencia: number;
  /** Largura mínima da tela (px) para mostrar o rótulo; abaixo disso ele não cabe. */
  larguraMinima?: number;
}

const DESLOCAMENTO: Record<Alinhamento, string> = {
  base: 'translate(-50%, -100%)',
  topo: 'translate(-50%, 0)',
  centro: 'translate(-50%, -50%)',
  esquerda: 'translate(0, -50%)',
  direita: 'translate(-100%, -50%)',
};
const ORIGEM: Record<Alinhamento, string> = {
  base: '50% 100%',
  topo: '50% 0',
  centro: '50% 50%',
  esquerda: '0 50%',
  direita: '100% 50%',
};

interface Rotulo {
  ancora?: AncoraRotulo;
  elemento?: HTMLElement;
  visivel?: boolean;
}

/**
 * Prende elementos HTML (placas, etiquetas) a pontos da cena 3D.
 *
 * A cada frame projeta cada âncora na tela e escreve o `transform` direto no elemento,
 * fora do Angular: mover dezenas de rótulos 60 vezes por segundo não dispara detecção
 * de mudanças. O tamanho acompanha a distância, para a placa parecer parte do ambiente.
 */
export class RotulosCena {
  private readonly rotulos = new Map<string, Rotulo>();
  private area: Area = 'entrada';
  private readonly projetado = new Vector3();

  registrar(id: string, elemento: HTMLElement): void {
    const rotulo = this.obter(id);
    rotulo.elemento = elemento;
    rotulo.visivel = undefined;
    elemento.style.position = 'absolute';
    elemento.style.left = '0';
    elemento.style.top = '0';
    this.esconder(rotulo);
  }

  remover(id: string): void {
    const rotulo = this.rotulos.get(id);
    if (!rotulo) return;
    rotulo.elemento = undefined;
    if (!rotulo.ancora) this.rotulos.delete(id);
  }

  definirAncoras(ancoras: readonly AncoraRotulo[]): void {
    for (const ancora of ancoras) {
      this.obter(ancora.id).ancora = ancora;
    }
  }

  definirArea(area: Area): void {
    this.area = area;
  }

  /** Chamado a cada frame, depois do render. `largura`/`altura` em pixels do canvas. */
  atualizar(camera: PerspectiveCamera, largura: number, altura: number): void {
    // Telas pequenas (celular em pé ou deitado): rótulos menores. Vale o lado mais apertado.
    const escalaTela = MathUtils.clamp(Math.min(largura / 1280, altura / 800), 0.5, 1);

    for (const rotulo of this.rotulos.values()) {
      const { ancora, elemento } = rotulo;
      if (!ancora || !elemento) continue;

      if (!ancora.areas.includes(this.area) || largura < (ancora.larguraMinima ?? 0)) {
        this.esconder(rotulo);
        continue;
      }
      this.projetado.copy(ancora.posicao).project(camera);
      const atrasOuFora =
        this.projetado.z > 1 ||
        this.projetado.z < -1 ||
        Math.abs(this.projetado.x) > 1.15 ||
        Math.abs(this.projetado.y) > 1.15;
      if (atrasOuFora) {
        this.esconder(rotulo);
        continue;
      }

      const x = ((this.projetado.x + 1) / 2) * largura;
      const y = ((1 - this.projetado.y) / 2) * altura;
      const distancia = camera.position.distanceTo(ancora.posicao);
      const escala =
        MathUtils.clamp(ancora.distanciaReferencia / distancia, 0.45, 1.25) * escalaTela;

      elemento.style.transformOrigin = ORIGEM[ancora.alinhamento];
      elemento.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) ${
        DESLOCAMENTO[ancora.alinhamento]
      } scale(${escala.toFixed(3)})`;
      // Mais perto fica por cima.
      elemento.style.zIndex = String(1000 - Math.round(distancia * 10));
      this.mostrar(rotulo);
    }
  }

  private obter(id: string): Rotulo {
    let rotulo = this.rotulos.get(id);
    if (!rotulo) {
      rotulo = {};
      this.rotulos.set(id, rotulo);
    }
    return rotulo;
  }

  private mostrar(rotulo: Rotulo): void {
    if (rotulo.visivel === true || !rotulo.elemento) return;
    rotulo.visivel = true;
    rotulo.elemento.style.opacity = '1';
    rotulo.elemento.style.pointerEvents = 'auto';
    rotulo.elemento.removeAttribute('aria-hidden');
    rotulo.elemento.removeAttribute('tabindex');
  }

  private esconder(rotulo: Rotulo): void {
    if (rotulo.visivel === false || !rotulo.elemento) return;
    rotulo.visivel = false;
    rotulo.elemento.style.opacity = '0';
    rotulo.elemento.style.pointerEvents = 'none';
    // Escondido também para teclado e leitor de tela.
    rotulo.elemento.setAttribute('aria-hidden', 'true');
    rotulo.elemento.setAttribute('tabindex', '-1');
  }
}
