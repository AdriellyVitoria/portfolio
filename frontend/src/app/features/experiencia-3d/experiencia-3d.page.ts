import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { PerfilRepository } from '../../core/data/perfil.repository';
import type { Area, PainelCafe } from '../../core/models';
import { SEO_PADRAO, SeoService } from '../../core/seo/seo.service';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { suportaWebGL } from '../../scene/qualidade';
import { SceneBridgeService } from '../../scene/scene-bridge.service';
import { SceneEngineService } from '../../scene/scene-engine.service';
import { PainelComponent } from '../../shared/ui/painel.component';
import { TagComponent } from '../../shared/ui/tag.component';
import { ContatoComponent } from '../cafe/contato.component';
import { SobreComponent } from '../cafe/sobre.component';
import { PainelProjetoComponent } from '../livraria/painel-projeto.component';

interface EstacaoMenu {
  area: Area;
  rotulo: string;
  dica: string;
}

const ESTACOES_MENU: EstacaoMenu[] = [
  { area: 'entrada', rotulo: 'Entrada', dica: 'Bem-vindo! Escolha uma área para entrar.' },
  {
    area: 'livraria',
    rotulo: 'Livraria',
    dica: 'Cada livro é um projeto. Toque em um para abrir.',
  },
  {
    area: 'floricultura',
    rotulo: 'Floricultura',
    dica: 'Cada vaso é uma skill. Escolha uma para destacar os projetos.',
  },
  { area: 'cafe', rotulo: 'Café', dica: 'Notebook, cardápio e pasta: um pouco sobre mim.' },
];

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
  ],
  providers: [SceneEngineService, SceneBridgeService],
  templateUrl: './experiencia-3d.page.html',
  styleUrl: './experiencia-3d.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Experiencia3dPage {
  protected readonly estado = inject(PortfolioStateService);
  protected readonly ponte = inject(SceneBridgeService);
  protected readonly perfil = toSignal(inject(PerfilRepository).obter());

  protected readonly estacoes = ESTACOES_MENU;
  protected readonly itensCafe = ITENS_CAFE;
  protected readonly semWebGL = signal(false);

  protected readonly estacaoAtual = computed(
    () => ESTACOES_MENU.find((e) => e.area === this.estado.areaAtual()) ?? ESTACOES_MENU[0],
  );
  protected readonly projetosOrdenados = computed(() =>
    [...this.estado.projetos()].sort((a, b) => Number(b.destaque) - Number(a.destaque)),
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
}
