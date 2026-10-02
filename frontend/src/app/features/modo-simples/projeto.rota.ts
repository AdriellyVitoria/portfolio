import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';

import { SEO_PADRAO, SeoService } from '../../core/seo/seo.service';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { PainelComponent } from '../../shared/ui/painel.component';
import { PainelProjetoComponent } from '../livraria/painel-projeto.component';

/**
 * Rota filha `/simples/projetos/:id`: abre o painel do projeto por cima da página.
 * A URL é compartilhável, é pré-renderizada e o botão Voltar fecha o painel.
 */
@Component({
  selector: 'app-projeto-rota',
  imports: [PainelComponent, PainelProjetoComponent],
  template: `
    @if (estado.projetoSelecionado(); as projeto) {
      <app-painel [titulo]="projeto.nome" (fechar)="fechar()">
        <app-painel-projeto
          [projeto]="projeto"
          [tecnologias]="estado.skillsDe(projeto.tecnologias)"
        />
      </app-painel>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjetoRota {
  /** Vem do parâmetro `:id` da rota (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly estado = inject(PortfolioStateService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      const id = this.id();
      if (this.estado.carregando()) {
        return;
      }
      untracked(() => {
        if (!this.estado.selecionarProjeto(id)) {
          this.router.navigate(['/simples'], { replaceUrl: true });
          return;
        }
        const projeto = this.estado.projetoSelecionado();
        if (projeto) {
          this.seo.atualizar({
            titulo: `${projeto.nome} — ${SEO_PADRAO.titulo}`,
            descricao: projeto.descricaoCurta,
          });
        }
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.estado.fecharProjeto();
      this.seo.atualizar();
    });
  }

  protected fechar(): void {
    this.router.navigate(['/simples']);
  }
}
