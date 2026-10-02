import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type Icone = 'github' | 'linkedin' | 'email' | 'link';

// Caminhos SVG 24x24 (traço), desenhados para esta paleta: simples e sem marca registrada.
const ICONES: Record<Icone, string> = {
  github:
    'M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  linkedin:
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  email: 'M4 4h16v16H4zM22 6l-10 7L2 6',
  link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
};

/** Link com ícone. Links web abrem em nova aba e avisam leitores de tela. */
@Component({
  selector: 'app-icone-link',
  template: `
    <a
      [href]="url()"
      [attr.target]="externo() ? '_blank' : null"
      [attr.rel]="externo() ? 'noopener noreferrer' : null"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path [attr.d]="caminho()" />
      </svg>
      <span>{{ rotulo() }}</span>
      @if (externo()) {
        <span class="sr-only">(abre em nova aba)</span>
      }
    </a>
  `,
  styles: `
    a {
      display: inline-flex;
      align-items: center;
      gap: var(--esp-2);
      min-height: 44px;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconeLinkComponent {
  readonly url = input.required<string>();
  readonly rotulo = input.required<string>();
  readonly icone = input<Icone>('link');

  protected readonly caminho = computed(() => ICONES[this.icone()]);
  /** Links web abrem em nova aba; mailto: e tel: não. */
  protected readonly externo = computed(() => /^https?:/.test(this.url()));
}
