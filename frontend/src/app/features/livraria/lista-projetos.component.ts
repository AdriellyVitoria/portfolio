import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import type { Skill } from '../../core/models';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { TagComponent } from '../../shared/ui/tag.component';
import { CardProjetoComponent } from './card-projeto.component';

/** Estante de projetos com filtro por tecnologia (o mesmo filtro da floricultura). */
@Component({
  selector: 'app-lista-projetos',
  imports: [CardProjetoComponent, TagComponent],
  templateUrl: './lista-projetos.component.html',
  styleUrl: './lista-projetos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaProjetosComponent {
  /** Prefixo da rota de detalhes (ex.: '/simples/projetos'). */
  readonly rotaBase = input('/simples/projetos');

  protected readonly estado = inject(PortfolioStateService);

  /** Só as tecnologias que aparecem em algum projeto, na ordem das skills. */
  protected readonly tecnologiasDisponiveis = computed<Skill[]>(() => {
    const usadas = new Set(this.estado.projetos().flatMap((p) => p.tecnologias));
    return this.estado.skills().filter((s) => usadas.has(s.id));
  });

  protected readonly projetosVisiveis = computed(() =>
    this.estado.filtroTecnologia() ? this.estado.projetosDestacados() : this.estado.projetos(),
  );

  protected readonly resumoFiltro = computed(() => {
    const skill = this.estado.skillFiltrada();
    const total = this.projetosVisiveis().length;
    const projetos = total === 1 ? '1 projeto' : `${total} projetos`;
    return skill ? `${projetos} com ${skill.nome}` : `${projetos} no total`;
  });
}
