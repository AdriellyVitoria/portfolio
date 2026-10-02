import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CATEGORIAS_SKILL, type CategoriaSkill, type Skill } from '../../core/models';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { TagComponent } from '../../shared/ui/tag.component';

interface Prateleira {
  categoria: CategoriaSkill;
  rotulo: string;
  skills: Skill[];
}

/**
 * Skills agrupadas por categoria. Escolher uma skill destaca os projetos
 * que a usam: é o mesmo estado que a estante (e a cena 3D) leem.
 */
@Component({
  selector: 'app-skills',
  imports: [RouterLink, TagComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  /** Rota da página onde fica a estante de projetos (para o link "ver projetos"). */
  readonly rotaProjetos = input('/simples');

  protected readonly estado = inject(PortfolioStateService);

  protected readonly prateleiras = computed<Prateleira[]>(() =>
    CATEGORIAS_SKILL.map(({ id, rotulo }) => ({
      categoria: id,
      rotulo,
      skills: this.estado.skills().filter((s) => s.categoria === id),
    })).filter((p) => p.skills.length),
  );

  protected readonly totalPorSkill = computed(() => {
    const total = new Map<string, number>();
    this.estado
      .projetos()
      .flatMap((p) => p.tecnologias)
      .forEach((id) => total.set(id, (total.get(id) ?? 0) + 1));
    return total;
  });

  protected readonly feedback = computed(() => {
    const skill = this.estado.skillFiltrada();
    if (!skill) {
      return null;
    }
    const total = this.estado.projetosDestacados().length;
    if (total === 0) {
      return { texto: `${skill.nome} ainda não aparece em nenhum projeto.`, temProjetos: false };
    }
    const projetos = total === 1 ? '1 projeto' : `${total} projetos`;
    return { texto: `${skill.nome} aparece em ${projetos}.`, temProjetos: true };
  });
}
