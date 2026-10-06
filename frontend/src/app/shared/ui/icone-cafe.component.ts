import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconeCafe = 'livro' | 'flor' | 'xicara';

// Ícones de traço 24x24, desenhados para as placas (sem marcas registradas).
const CAMINHOS: Record<IconeCafe, string> = {
  livro:
    'M4 5.5C6.5 4 9.5 4 12 5.5v13c-2.5-1.5-5.5-1.5-8 0zM20 5.5C17.5 4 14.5 4 12 5.5v13c2.5-1.5 5.5-1.5 8 0z',
  flor: 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 7c0-2 1-3.5 2.5-3.5S16 5.5 15 7.5M9 7.5C8 5.5 8 3.5 9.5 3.5S12 5 12 7M9.5 12.5C7 13 5.5 12 5.5 10.5S7.5 8.5 9.2 9M14.8 9c1.7-.5 3.7.5 3.7 1.5S17 13 14.5 12.5M12 13v8M12 18c-2-2.5-4.5-2.5-5.5-1.5M12 17c2-2 4-2 5-1',
  xicara:
    'M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.8 1 .8 2-.1 3M11 3.5c-.8 1 .8 2-.1 3',
};

/** Ícones pequenos das placas (livraria, floricultura, café). Decorativos. */
@Component({
  selector: 'app-icone-cafe',
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="tamanho()"
      [attr.height]="tamanho()"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path [attr.d]="caminho()" />
    </svg>
  `,
  styles: ':host { display: inline-flex; flex-shrink: 0; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconeCafeComponent {
  readonly icone = input.required<IconeCafe>();
  readonly tamanho = input(20);

  protected readonly caminho = computed(() => CAMINHOS[this.icone()]);
}
