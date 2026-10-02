import { MathUtils, type PerspectiveCamera, Spherical, Vector3 } from 'three';

import type { Estacao } from './estacoes';

// Quanto o visitante pode girar a câmera arrastando, dentro de uma estação (radianos).
const LIMITE_AZIMUTE = 0.45;
const LIMITE_POLAR = 0.18;
const SENSIBILIDADE = 0.004;
const DURACAO_TRANSICAO = 1.6;

const suavizar = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Move a câmera entre estações com uma transição suave (lerp + easing) e permite
 * uma rotação leve em volta do ponto de interesse, que volta sozinha ao soltar.
 * Não sabe nada de Angular: recebe a câmera e é atualizado a cada frame.
 */
export class CameraDirector {
  private readonly origemPosicao = new Vector3();
  private readonly origemAlvo = new Vector3();
  private readonly destinoPosicao = new Vector3();
  private readonly destinoAlvo = new Vector3();
  private progresso = 1;

  /** Posição e alvo "oficiais" (sem o giro do arrasto). */
  private readonly posicaoBase = new Vector3();
  readonly alvo = new Vector3();

  private azimute = 0;
  private polar = 0;
  private arrastando = false;

  private readonly deslocamento = new Vector3();
  private readonly esfera = new Spherical();

  constructor(
    private readonly camera: PerspectiveCamera,
    private readonly reduzirMovimento: boolean,
  ) {}

  get emTransicao(): boolean {
    return this.progresso < 1;
  }

  /** Coloca a câmera na estação sem animação. */
  posicionar(estacao: Estacao): void {
    this.posicaoBase.copy(estacao.posicao);
    this.alvo.copy(estacao.alvo);
    this.destinoPosicao.copy(estacao.posicao);
    this.destinoAlvo.copy(estacao.alvo);
    this.progresso = 1;
    this.aplicar();
  }

  irPara(estacao: Estacao): void {
    if (this.reduzirMovimento) {
      this.azimute = 0;
      this.polar = 0;
      this.posicionar(estacao);
      return;
    }
    // Parte de onde está agora, mesmo que outra transição esteja no meio.
    this.origemPosicao.copy(this.posicaoBase);
    this.origemAlvo.copy(this.alvo);
    this.destinoPosicao.copy(estacao.posicao);
    this.destinoAlvo.copy(estacao.alvo);
    this.progresso = 0;
  }

  /** Arrasto em pixels desde o último evento. */
  arrastar(dx: number, dy: number): void {
    this.arrastando = true;
    this.azimute = MathUtils.clamp(
      this.azimute - dx * SENSIBILIDADE,
      -LIMITE_AZIMUTE,
      LIMITE_AZIMUTE,
    );
    this.polar = MathUtils.clamp(this.polar - dy * SENSIBILIDADE, -LIMITE_POLAR, LIMITE_POLAR);
  }

  soltar(): void {
    this.arrastando = false;
  }

  update(dt: number): void {
    if (this.progresso < 1) {
      this.progresso = Math.min(1, this.progresso + dt / DURACAO_TRANSICAO);
      const t = suavizar(this.progresso);
      this.posicaoBase.lerpVectors(this.origemPosicao, this.destinoPosicao, t);
      this.alvo.lerpVectors(this.origemAlvo, this.destinoAlvo, t);
    }
    if (!this.arrastando) {
      // Volta devagar ao enquadramento da estação (decaimento exponencial).
      const fator = this.reduzirMovimento ? 0 : Math.exp(-dt * 2.5);
      this.azimute *= fator;
      this.polar *= fator;
    }
    this.aplicar();
  }

  private aplicar(): void {
    this.deslocamento.copy(this.posicaoBase).sub(this.alvo);
    this.esfera.setFromVector3(this.deslocamento);
    this.esfera.theta += this.azimute;
    this.esfera.phi = MathUtils.clamp(this.esfera.phi + this.polar, 0.3, Math.PI / 2 - 0.02);
    this.deslocamento.setFromSpherical(this.esfera);
    this.camera.position.copy(this.alvo).add(this.deslocamento);
    this.camera.lookAt(this.alvo);
  }
}
