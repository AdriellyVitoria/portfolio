import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TomTag = 'neutro' | 'destaque';

/**
 * Etiqueta. Em `<button>` vira um filtro alternável: quem usa define `aria-pressed`.
 */
@Component({
  selector: 'span[app-tag], li[app-tag], button[app-tag]',
  template: '<ng-content />',
  styleUrl: './tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"tag tag--" + tom()',
    '[class.tag--ativa]': 'ativa()',
  },
})
export class TagComponent {
  readonly tom = input<TomTag>('neutro');
  readonly ativa = input(false);
}
