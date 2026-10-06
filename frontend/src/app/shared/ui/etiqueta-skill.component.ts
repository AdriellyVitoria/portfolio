import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Etiqueta de skill: balão creme com ponteiro para baixo (indicador estilo jogo),
 * categoria em negrito e a lista de tecnologias.
 */
@Component({
  selector: 'app-etiqueta-skill',
  template: `
    <span class="etiqueta" [class.etiqueta--ativa]="ativa()">
      <strong class="etiqueta__titulo">{{ titulo() }}</strong>
      <span class="etiqueta__itens">{{ itens().join(' · ') }}</span>
    </span>
  `,
  styleUrl: './etiqueta-skill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtiquetaSkillComponent {
  readonly titulo = input.required<string>();
  readonly itens = input<string[]>([]);
  readonly ativa = input(false);
}
