import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { AuroraService } from '../../core/aurora/aurora.service';
import { PerfilRepository } from '../../core/data/perfil.repository';
import {
  type Area,
  CATEGORIAS_SKILL,
  type CategoriaSkill,
  type PainelCafe,
} from '../../core/models';
import { SEO_PADRAO, SeoService } from '../../core/seo/seo.service';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { suportaWebGL } from '../../scene/qualidade';
import { SceneBridgeService } from '../../scene/scene-bridge.service';
import { SceneEngineService } from '../../scene/scene-engine.service';
import { EtiquetaSkillComponent } from '../../shared/ui/etiqueta-skill.component';
import type { IconeCafe } from '../../shared/ui/icone-cafe.component';
import { PainelComponent } from '../../shared/ui/painel.component';
import { PlacaFachadaComponent } from '../../shared/ui/placa-fachada.component';
import { PlacaSecaoComponent } from '../../shared/ui/placa-secao.component';
import { TagComponent } from '../../shared/ui/tag.component';
import { ContatoComponent } from '../cafe/contato.component';
import { SobreComponent } from '../cafe/sobre.component';
import { AuroraChatComponent } from '../aurora-chat/aurora-chat.component';
import { AuroraPilulaComponent } from '../aurora-chat/aurora-pilula.component';
import { PainelProjetoComponent } from '../livraria/painel-projeto.component';
import { RotuloCenaDirective } from './rotulo-cena.directive';

interface EstacaoMenu {
  area: Area;
  rotulo: string;
  dica: string;
}

const ESTACOES_MENU: EstacaoMenu[] = [
  {
    area: 'entrada',
    rotulo: 'Entrada',
    dica: 'Bem-vindo! Escolha uma área para entrar. No café, a Aurora responde suas perguntas.',
  },
  {
    area: 'livraria',
    rotulo: 'Livraria',
    dica: 'Cada livro é um projeto. Toque em um para abrir.',
  },
  {
    area: 'floricultura',
    rotulo: 'Floricultura',
    dica: 'Cada vaso é uma categoria de skills. Toque em um para ver as tecnologias.',
  },
  {
    area: 'cafe',
    rotulo: 'Café',
    dica: 'Notebook, cardápio e pasta: um pouco sobre mim. Toque no sino do balcão para falar com a Aurora.',
  },
];

/** Placas de seção (HTML presas à cena). */
const SECOES: { area: Area; titulo: string; subtitulo: string; icone: IconeCafe }[] = [
  { area: 'livraria', titulo: 'Livraria', subtitulo: 'Projetos', icone: 'livro' },
  { area: 'floricultura', titulo: 'Floricultura', subtitulo: 'Skills', icone: 'flor' },
  { area: 'cafe', titulo: 'Café', subtitulo: 'Sobre mim', icone: 'xicara' },
];

/** O balcão da Aurora faz parte do café (no menu e no HUD). */
const NO_CAFE: readonly Area[] = ['cafe', 'aurora'];

const ITENS_CAFE: { id: PainelCafe; rotulo: string; titulo: string }[] = [
  { id: 'apresentacao', rotulo: 'Notebook', titulo: 'Apresentação' },
  { id: 'trajetoria', rotulo: 'Cardápio', titulo: 'Trajetória' },
  { id: 'contato', rotulo: 'Pasta', titulo: 'Contato e currículo' },
];

/**
 * Experiência 3D. Hospeda o canvas e a interface HTML por cima dele.
 * A cena e esta página nunca se falam diretamente: ambas leem e escrevem no
 * PortfolioStateService (a ponte é o SceneBridgeService).
 */
@Component({
  selector: 'app-experiencia-3d',
  imports: [
    RouterLink,
    PainelComponent,
    PainelProjetoComponent,
    TagComponent,
    SobreComponent,
    ContatoComponent,
    AuroraChatComponent,
    AuroraPilulaComponent,
    PlacaFachadaComponent,
    PlacaSecaoComponent,
    EtiquetaSkillComponent,
    RotuloCenaDirective,
  ],
  providers: [SceneEngineService, SceneBridgeService],
  templateUrl: './experiencia-3d.page.html',
  styleUrl: './experiencia-3d.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Experiencia3dPage {
  protected readonly estado = inject(PortfolioStateService);
  protected readonly ponte = inject(SceneBridgeService);
  protected readonly aurora = inject(AuroraService);
  protected readonly perfil = toSignal(inject(PerfilRepository).obter());

  protected readonly estacoes = ESTACOES_MENU;
  protected readonly itensCafe = ITENS_CAFE;
  protected readonly secoes = SECOES;
  protected readonly semWebGL = signal(false);

  /** Área do menu (o balcão da Aurora conta como café). */
  protected readonly areaMenu = computed<Area>(() =>
    NO_CAFE.includes(this.estado.areaAtual()) ? 'cafe' : this.estado.areaAtual(),
  );
  protected readonly estacaoAtual = computed(
    () => ESTACOES_MENU.find((e) => e.area === this.areaMenu()) ?? ESTACOES_MENU[0],
  );
  /** O chat só aparece no café; fora dele, só o atalho para voltar. */
  protected readonly chatVisivel = computed(
    () => this.aurora.aberta() && !this.aurora.recolhida() && this.areaMenu() === 'cafe',
  );
  protected readonly pilulaVisivel = computed(() => this.aurora.aberta() && !this.chatVisivel());
  protected readonly projetosOrdenados = computed(() =>
    [...this.estado.projetos()].sort((a, b) => Number(b.destaque) - Number(a.destaque)),
  );
  /** Floricultura: categorias (um vaso cada) e as skills da categoria escolhida. */
  protected readonly categorias = computed(() =>
    CATEGORIAS_SKILL.map((c) => ({
      ...c,
      total: this.estado.skills().filter((s) => s.categoria === c.id).length,
    })).filter((c) => c.total),
  );
  /** Etiquetas dos vasos: categoria + nomes das skills. */
  protected readonly categoriasEtiquetas = computed(() =>
    this.categorias().map((c) => ({
      ...c,
      nomes: this.estado
        .skills()
        .filter((s) => s.categoria === c.id)
        .map((s) => s.nome),
    })),
  );
  protected readonly categoriaAtual = computed(() =>
    CATEGORIAS_SKILL.find((c) => c.id === this.estado.categoriaSkill()),
  );
  protected readonly skillsDaCategoria = computed(() =>
    this.estado.skills().filter((s) => s.categoria === this.estado.categoriaSkill()),
  );
  protected readonly tituloPainelCafe = computed(
    () => ITENS_CAFE.find((i) => i.id === this.estado.painelCafe())?.titulo ?? '',
  );

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    inject(SeoService).atualizar({
      titulo: `Explorar em 3D — ${SEO_PADRAO.titulo}`,
      descricao:
        'Entre no café, livraria e floricultura de outono e conheça os projetos e skills de Adrielly.',
    });
    this.estado.irPara('entrada');

    // Saiu do café com a conversa aberta (pelo menu ou por uma ação): recolhe o chat.
    effect(() => {
      if (this.areaMenu() !== 'cafe') this.aurora.recolher();
    });

    // WebGL só existe no navegador: nada de 3D no prerender.
    afterNextRender(() => {
      if (!suportaWebGL()) {
        this.semWebGL.set(true);
        return;
      }
      this.ponte.conectar(this.canvas().nativeElement);
    });

    inject(DestroyRef).onDestroy(() => {
      this.ponte.desconectar();
      this.estado.fecharProjeto();
      this.estado.fecharPainelCafe();
    });
  }

  protected abrirProjeto(id: string): void {
    this.estado.selecionarProjeto(id);
  }

  protected verNaLivraria(): void {
    this.estado.irPara('livraria');
  }

  protected escolherCategoria(categoria: CategoriaSkill): void {
    this.estado.irPara('floricultura');
    this.estado.selecionarCategoria(this.estado.categoriaSkill() === categoria ? null : categoria);
  }

  protected falarComAurora(): void {
    this.estado.irPara('aurora');
    this.aurora.abrir();
  }

  protected voltarParaAurora(): void {
    this.estado.irPara('aurora');
    this.aurora.voltar();
  }
}
