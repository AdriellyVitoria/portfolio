import { Injectable } from '@angular/core';
import {
  ACESFilmicToneMapping,
  Color,
  Fog,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

import type { Projeto, Skill } from '../core/models';
import { Ambiente } from './areas/ambiente';
import { CafeArea } from './areas/cafe.area';
import { FloriculturaArea } from './areas/floricultura.area';
import { Folhas } from './areas/folhas';
import { LivrariaArea } from './areas/livraria.area';
import { CameraDirector } from './camera-director';
import type { Estacao } from './estacoes';
import { type CallbacksInteracao, Interacao } from './interaction';
import type { ConfigQualidade } from './qualidade';
import { RotulosCena } from './rotulos';
import type { ParteCena } from './tipos';
import { descartar } from './util';

export interface OpcoesMotor {
  qualidade: ConfigQualidade;
  reduzirMovimento: boolean;
  estacaoInicial: Estacao;
  callbacks: CallbacksInteracao;
  aoPrimeiroFrame(): void;
}

const COR_CEU = 0xf2d4b0; // fim de tarde de outono

/**
 * Motor da cena: renderer, câmera, render loop e ciclo de vida.
 * Não conhece componentes Angular; quem conversa com o estado é o SceneBridgeService.
 *
 * Sem zone.js (app zoneless), o requestAnimationFrame do loop não dispara
 * detecção de mudanças: o loop de 60 fps não custa nada ao Angular.
 */
@Injectable()
export class SceneEngineService {
  private renderer?: WebGLRenderer;
  private readonly cena = new Scene();
  private readonly camera = new PerspectiveCamera(50, 1, 0.1, 80);
  private director?: CameraDirector;
  private interacao?: Interacao;
  private observadorTamanho?: ResizeObserver;
  private partes: ParteCena[] = [];
  private ambiente?: Ambiente;

  private ultimoInstante = 0;
  private tempo = 0;
  private aoPrimeiroFrame?: () => void;

  /** Placas e etiquetas HTML presas a pontos da cena. */
  readonly rotulos = new RotulosCena();

  livraria?: LivrariaArea;
  floricultura?: FloriculturaArea;
  cafe?: CafeArea;

  iniciar(canvas: HTMLCanvasElement, opcoes: OpcoesMotor): void {
    const { qualidade } = opcoes;
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: qualidade.antialias,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualidade.pixelRatioMaximo));
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = qualidade.sombras;
    this.renderer.shadowMap.type = PCFShadowMap;

    this.cena.background = new Color(COR_CEU);
    this.cena.fog = new Fog(COR_CEU, 16, 42);

    this.ambiente = new Ambiente(qualidade);
    this.livraria = new LivrariaArea();
    this.floricultura = new FloriculturaArea();
    this.cafe = new CafeArea(opcoes.reduzirMovimento);
    const folhas = new Folhas(qualidade.folhas, opcoes.reduzirMovimento);
    this.partes = [this.ambiente, this.livraria, this.floricultura, this.cafe, folhas];
    this.partes.forEach((parte) => this.cena.add(parte.grupo));

    this.director = new CameraDirector(this.camera, opcoes.reduzirMovimento);
    this.director.posicionar(opcoes.estacaoInicial);

    this.interacao = new Interacao(canvas, this.camera, {
      ...opcoes.callbacks,
      aoArrastar: (dx, dy) => this.director?.arrastar(dx, dy),
      aoSoltar: () => this.director?.soltar(),
    });
    this.atualizarAlvos();
    this.atualizarAncoras();

    this.observadorTamanho = new ResizeObserver(() => this.redimensionar(canvas));
    this.observadorTamanho.observe(canvas);
    this.redimensionar(canvas);

    this.aoPrimeiroFrame = opcoes.aoPrimeiroFrame;
    document.addEventListener('visibilitychange', this.aoMudarVisibilidade);
    this.iniciarLoop();
  }

  /** (Re)gera livros e vasos a partir dos dados. */
  montarDados(projetos: Projeto[], skills: Skill[]): void {
    this.livraria?.montar(projetos);
    this.floricultura?.montar(skills);
    this.atualizarAlvos();
    this.atualizarAncoras();
  }

  irPara(estacao: Estacao): void {
    this.director?.irPara(estacao);
  }

  destruir(): void {
    if (!this.renderer) return;
    this.renderer?.setAnimationLoop(null);
    document.removeEventListener('visibilitychange', this.aoMudarVisibilidade);
    this.observadorTamanho?.disconnect();
    this.interacao?.destruir();
    descartar(this.cena);
    this.cena.clear();
    this.renderer?.dispose();
    // Libera o contexto WebGL já, sem esperar o coletor de lixo (o navegador limita quantos existem).
    this.renderer?.forceContextLoss();
    this.renderer = undefined;
    this.partes = [];
  }

  private atualizarAncoras(): void {
    this.rotulos.definirAncoras([
      ...(this.ambiente?.ancoras() ?? []),
      ...(this.livraria?.ancoras() ?? []),
      ...(this.floricultura?.ancoras() ?? []),
      ...(this.cafe?.ancoras() ?? []),
    ]);
  }

  private atualizarAlvos(): void {
    this.interacao?.definirAlvos(
      [
        ...(this.livraria?.alvos ?? []),
        ...(this.floricultura?.alvos ?? []),
        ...(this.cafe?.alvos ?? []),
      ],
      this.ambiente?.oclusores ?? [],
    );
  }

  private iniciarLoop(): void {
    this.ultimoInstante = performance.now();
    this.renderer?.setAnimationLoop((instante) => this.quadro(instante));
  }

  private quadro(instante: number): void {
    // Limita o dt: depois de uma pausa longa, nada "salta".
    const dt = Math.min(0.05, (instante - this.ultimoInstante) / 1000);
    this.ultimoInstante = instante;
    this.tempo += dt;

    this.director?.update(dt);
    for (const parte of this.partes) {
      parte.update(dt, this.tempo);
    }
    this.renderer?.render(this.cena, this.camera);
    const canvas = this.renderer?.domElement;
    if (canvas) this.rotulos.atualizar(this.camera, canvas.clientWidth, canvas.clientHeight);

    if (this.aoPrimeiroFrame) {
      this.aoPrimeiroFrame();
      this.aoPrimeiroFrame = undefined;
    }
  }

  /** Aba escondida = loop parado (economiza bateria e GPU). */
  private readonly aoMudarVisibilidade = () => {
    if (document.hidden) {
      this.renderer?.setAnimationLoop(null);
    } else {
      this.iniciarLoop();
    }
  };

  private redimensionar(canvas: HTMLCanvasElement): void {
    const largura = canvas.clientWidth;
    const altura = canvas.clientHeight;
    if (!this.renderer || !largura || !altura) return;
    this.renderer.setSize(largura, altura, false);
    this.camera.aspect = largura / altura;
    // Em retrato (celular), abre o campo de visão para caber a mesma cena.
    this.camera.fov =
      this.camera.aspect < 1 ? Math.min(75, (50 / Math.max(this.camera.aspect, 0.5)) * 0.7) : 50;
    this.camera.updateProjectionMatrix();
  }
}
