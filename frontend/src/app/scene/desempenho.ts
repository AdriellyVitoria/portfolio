import type { NivelQualidade } from './qualidade';

/** O que o monitor decidiu depois de uma janela de medição. */
export type DecisaoDesempenho = 'manter' | 'baixar' | 'lento-demais';

export interface OpcoesMonitor {
  /** Duração de cada janela de medição (s). */
  janela: number;
  /** Ignora o começo (compilação de shaders, upload de texturas). */
  aquecimento: number;
  /** Abaixo disso (fps médio da janela) a janela conta como lenta. */
  fpsMinimo: number;
  /** Quantas janelas lentas seguidas antes de agir (evita reagir a um engasgo). */
  janelasLentas: number;
}

const PADRAO: OpcoesMonitor = { janela: 2, aquecimento: 3, fpsMinimo: 28, janelasLentas: 2 };

const ABAIXO: Record<NivelQualidade, NivelQualidade | null> = {
  alta: 'media',
  media: 'baixa',
  baixa: null,
};

/**
 * Mede o FPS real em janelas de alguns segundos e decide se a qualidade deve baixar.
 *
 * Só baixa, nunca sobe: subir e descer ficaria oscilando (a qualidade alta derruba
 * o FPS, que faz baixar, que melhora o FPS, que faria subir...). No nível mais
 * baixo, se ainda estiver lento, avisa uma vez ("lento-demais") para a página
 * oferecer a versão simples.
 *
 * Classe pura (sem Three nem DOM): o motor chama `registrar(dt)` a cada frame.
 */
export class MonitorDesempenho {
  private readonly opcoes: OpcoesMonitor;
  private decorrido = 0;
  private quadros = 0;
  private tempoJanela = 0;
  private lentasSeguidas = 0;
  private avisouLento = false;

  /** FPS médio da última janela completa (0 enquanto não mediu). */
  fps = 0;

  constructor(
    public nivel: NivelQualidade,
    opcoes: Partial<OpcoesMonitor> = {},
  ) {
    this.opcoes = { ...PADRAO, ...opcoes };
  }

  /** `dt` em segundos, sem limitar (o tempo real entre dois frames). */
  registrar(dt: number): DecisaoDesempenho | null {
    // Um frame de mais de 1 s é pausa (aba voltando, depurador), não lentidão.
    if (dt > 1) {
      this.reiniciar();
      return null;
    }
    this.decorrido += dt;
    if (this.decorrido < this.opcoes.aquecimento) return null;

    this.quadros++;
    this.tempoJanela += dt;
    if (this.tempoJanela < this.opcoes.janela) return null;

    this.fps = this.quadros / this.tempoJanela;
    this.quadros = 0;
    this.tempoJanela = 0;

    if (this.fps >= this.opcoes.fpsMinimo) {
      this.lentasSeguidas = 0;
      return 'manter';
    }
    if (++this.lentasSeguidas < this.opcoes.janelasLentas) return 'manter';
    this.lentasSeguidas = 0;

    const proximo = ABAIXO[this.nivel];
    if (proximo) {
      this.nivel = proximo;
      // Recomeça com aquecimento: a troca de qualidade recompila shaders.
      this.decorrido = 0;
      return 'baixar';
    }
    if (!this.avisouLento) {
      this.avisouLento = true;
      return 'lento-demais';
    }
    return 'manter';
  }

  /** Depois de uma pausa (aba escondida), a medição recomeça do zero. */
  reiniciar(): void {
    this.decorrido = 0;
    this.quadros = 0;
    this.tempoJanela = 0;
    this.lentasSeguidas = 0;
  }
}
