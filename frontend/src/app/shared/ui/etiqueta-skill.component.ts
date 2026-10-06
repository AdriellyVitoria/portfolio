import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Para onde o ponteiro da etiqueta aponta (onde está o objeto descrito). */
export type PonteiroEtiqueta = 'baixo' | 'esquerda' | 'direita';

/**
 * Etiqueta de skill: balão creme com ponteiro (indicador estilo jogo), categoria em
 * negrito e a lista de tecnologias. O ponteiro aponta para o objeto: para baixo
 * (etiqueta em cima dele) ou para um lado (etiqueta ao lado).
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
  host: { '[attr.data-ponteiro]': 'ponteiro()' },
})
export class EtiquetaSkillComponent {
  readonly titulo = input.required<string>();
  readonly itens = input<string[]>([]);
  readonly ativa = input(false);
  readonly ponteiro = input<PonteiroEtiqueta>('baixo');
}
