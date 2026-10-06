import { Injectable, effect, inject, signal } from '@angular/core';

import { AuroraService } from '../core/aurora/aurora.service';
import { PortfolioStateService } from '../core/state/portfolio-state.service';
import { ESTACOES } from './estacoes';
import { detectarQualidade, prefereMenosMovimento } from './qualidade';
import { SceneEngineService } from './scene-engine.service';
import type { AlvoInterativo } from './tipos';

export interface DicaCursor {
  rotulo: string;
  x: number;
  y: number;
}

/**
 * A única peça que conhece os dois lados:
 *   estado (signals) → cena: effects chamam métodos do motor e das áreas;
 *   cena → estado: cliques na cena viram chamadas aos métodos do estado.
 * Cliques na cena, a futura Aurora e o modo simples usam o mesmo estado.
 */
@Injectable()
export class SceneBridgeService {
  private readonly estado = inject(PortfolioStateService);
  private readonly motor = inject(SceneEngineService);
  private readonly aurora = inject(AuroraService);
  private readonly ativo = signal(false);

  /** A cena desenhou o primeiro frame (esconde a tela de carregamento). */
  readonly pronto = signal(false);
  readonly dicaCursor = signal<DicaCursor | null>(null);

  constructor() {
    effect(() => {
      if (!this.ativo() || this.estado.carregando()) return;
      this.motor.montarDados(this.estado.projetos(), this.estado.skills());
    });
    effect(() => {
      if (!this.ativo()) return;
      this.motor.irPara(ESTACOES[this.estado.areaAtual()]);
    });
    effect(() => {
      if (!this.ativo()) return;
      this.motor.livraria?.destacar(this.estado.idsProjetosDestacados());
    });
    effect(() => {
      if (!this.ativo()) return;
      this.motor.livraria?.selecionar(this.estado.projetoSelecionadoId());
    });
    effect(() => {
      if (!this.ativo()) return;
      this.motor.floricultura?.selecionar(this.estado.filtroTecnologia());
    });
    effect(() => {
      if (!this.ativo()) return;
      this.motor.cafe?.marcarAberto(this.estado.painelCafe());
    });
  }

  conectar(canvas: HTMLCanvasElement): void {
    this.motor.iniciar(canvas, {
      qualidade: detectarQualidade(),
      reduzirMovimento: prefereMenosMovimento(),
      estacaoInicial: ESTACOES[this.estado.areaAtual()],
      callbacks: {
        aoSelecionar: (alvo) => this.aoSelecionar(alvo),
        aoPassar: (alvo, x, y) => {
          this.dicaCursor.set(alvo ? { rotulo: alvo.rotulo, x, y } : null);
          this.motor.cafe?.marcarSobCursor(alvo?.tipo === 'cafe' ? alvo.id : null);
          this.motor.cafe?.marcarSinoSobCursor(alvo?.tipo === 'aurora');
        },
        aoArrastar: () => undefined,
        aoSoltar: () => undefined,
      },
      aoPrimeiroFrame: () => this.pronto.set(true),
    });
    this.ativo.set(true);
  }

  desconectar(): void {
    // No servidor (SSR) a cena nunca é conectada: não há nada para destruir.
    if (!this.ativo()) return;
    this.ativo.set(false);
    this.motor.destruir();
  }

  private aoSelecionar(alvo: AlvoInterativo): void {
    this.dicaCursor.set(null);
    switch (alvo.tipo) {
      case 'projeto':
        this.estado.irPara('livraria');
        this.estado.selecionarProjeto(alvo.id);
        break;
      case 'skill':
        this.estado.irPara('floricultura');
        this.estado.alternarTecnologia(alvo.id);
        break;
      case 'cafe':
        this.estado.irPara('cafe');
        this.estado.abrirPainelCafe(alvo.id);
        break;
      case 'aurora':
        this.estado.irPara('aurora');
        this.aurora.abrir();
        break;
    }
  }
}
