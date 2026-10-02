import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type VarianteBotao = 'primario' | 'secundario' | 'texto';

/** Estilo de botão aplicado sobre `<button>` ou `<a>` nativos (mantém a semântica). */
@Component({
  selector: 'button[app-botao], a[app-botao]',
  template: '<ng-content />',
  styleUrl: './botao.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"botao botao--" + variante()' },
})
export class BotaoComponent {
  readonly variante = input<VarianteBotao>('primario');
}
