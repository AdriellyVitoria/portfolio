import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Avatar 2D da Aurora: rosto mínimo com óculos redondos, na paleta. */
@Component({
  selector: 'app-avatar-aurora',
  template: `
    <svg viewBox="0 0 40 40" [attr.width]="tamanho()" [attr.height]="tamanho()" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="var(--cor-verde-escuro)" />
      <path
        d="M8 17c1-7 6-11 12-11s11 4 12 11c-3-3-7-4-12-4s-9 1-12 4z"
        fill="var(--cor-terracota)"
      />
      <g fill="none" stroke="var(--cor-creme)" stroke-width="2">
        <circle cx="14.5" cy="21" r="4" />
        <circle cx="25.5" cy="21" r="4" />
        <path d="M18.5 21h3" />
        <path d="M15 29c3 2.2 7 2.2 10 0" stroke-linecap="round" />
      </g>
    </svg>
  `,
  styles: ':host { display: inline-flex; flex-shrink: 0; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarAuroraComponent {
  readonly tamanho = input(40);
}
