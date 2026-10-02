import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { Projeto, Skill } from '../../core/models';
import { IconeLinkComponent } from '../../shared/ui/icone-link.component';
import { TagComponent } from '../../shared/ui/tag.component';

/** Detalhes de um projeto. Vai dentro de um `app-painel` (modo simples e, depois, cena 3D). */
@Component({
  selector: 'app-painel-projeto',
  imports: [IconeLinkComponent, TagComponent],
  templateUrl: './painel-projeto.component.html',
  styleUrl: './painel-projeto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PainelProjetoComponent {
  readonly projeto = input.required<Projeto>();
  readonly tecnologias = input.required<Skill[]>();
}
