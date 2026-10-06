import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuroraService } from '../../core/aurora/aurora.service';
import { PerfilRepository } from '../../core/data/perfil.repository';
import type { Area } from '../../core/models';
import { SeoService } from '../../core/seo/seo.service';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { BotaoComponent } from '../../shared/ui/botao.component';
import { AuroraChatComponent } from '../aurora-chat/aurora-chat.component';
import { AuroraPilulaComponent } from '../aurora-chat/aurora-pilula.component';
import { ContatoComponent } from '../cafe/contato.component';
import { SobreComponent } from '../cafe/sobre.component';
import { SkillsComponent } from '../floricultura/skills.component';
import { ListaProjetosComponent } from '../livraria/lista-projetos.component';

/** Seção da página que corresponde a cada área (os ids seguem as áreas). */
const SECAO_POR_AREA: Record<Area, string> = {
  entrada: 'conteudo',
  livraria: 'livraria',
  floricultura: 'floricultura',
  cafe: 'cafe',
  aurora: 'aurora',
};

/**
 * Versão 2D do portfólio: para quem tem pressa, acessibilidade, SEO e fallback do 3D.
 * Usa os mesmos dados e o mesmo estado que a experiência 3D.
 *
 * As ações da Aurora chegam como mudanças de estado; aqui elas viram rolagem até a
 * seção, a rota do painel de projeto ou a seção de contato.
 */
@Component({
  selector: 'app-modo-simples',
  imports: [
    RouterLink,
    RouterOutlet,
    BotaoComponent,
    ContatoComponent,
    ListaProjetosComponent,
    SkillsComponent,
    SobreComponent,
    AuroraChatComponent,
    AuroraPilulaComponent,
  ],
  templateUrl: './modo-simples.page.html',
  styleUrl: './modo-simples.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ModoSimplesPage {
  protected readonly perfil = toSignal(inject(PerfilRepository).obter());
  protected readonly aurora = inject(AuroraService);
  protected readonly anoAtual = new Date().getFullYear();

  private readonly estado = inject(PortfolioStateService);
  private readonly documento = inject(DOCUMENT);
  private readonly router = inject(Router);

  constructor() {
    inject(SeoService).atualizar();

    // NAVEGAR → rola até a seção. A primeira leitura é só o valor atual: não rola ao abrir a página.
    let primeiraLeitura = true;
    effect(() => {
      const area = this.estado.areaAtual();
      if (primeiraLeitura) {
        primeiraLeitura = false;
        return;
      }
      untracked(() => this.rolarPara(SECAO_POR_AREA[area]));
    });

    // ABRIR_PAINEL → no 2D não há painéis do café: rola até a seção correspondente.
    effect(() => {
      const painel = this.estado.painelCafe();
      if (!painel) return;
      untracked(() => {
        this.rolarPara(painel === 'contato' ? 'contato' : 'cafe');
        this.estado.fecharPainelCafe();
      });
    });

    // ABRIR_PROJETO → abre o painel pela rota (link compartilhável, Voltar fecha).
    effect(() => {
      const id = this.estado.projetoSelecionadoId();
      if (!id) return;
      untracked(() => {
        if (!this.router.url.includes(`/projetos/${id}`)) {
          void this.router.navigate(['/simples/projetos', id]);
        }
      });
    });
  }

  protected voltarParaAurora(): void {
    this.aurora.voltar();
    this.rolarPara('aurora');
  }

  private rolarPara(id: string): void {
    const secao = this.documento.getElementById(id);
    // `behavior` padrão segue o CSS: rolagem suave, ou instantânea com reduced-motion.
    if (typeof secao?.scrollIntoView === 'function') {
      secao.scrollIntoView({ block: 'start' });
    }
  }
}
