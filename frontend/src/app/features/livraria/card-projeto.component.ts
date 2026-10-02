import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Projeto, Skill } from '../../core/models';
import { TagComponent } from '../../shared/ui/tag.component';

/** Um "livro" da estante. O card inteiro é clicável, mas o link real é o título. */
@Component({
  selector: 'app-card-projeto',
  imports: [RouterLink, TagComponent],
  templateUrl: './card-projeto.component.html',
  styleUrl: './card-projeto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardProjetoComponent {
  readonly projeto = input.required<Projeto>();
  readonly tecnologias = input.required<Skill[]>();
  readonly rota = input.required<string>();

  protected readonly corLombada = computed(
    () => `var(--cor-${this.projeto().corCapa ?? 'terracota'})`,
  );
}
