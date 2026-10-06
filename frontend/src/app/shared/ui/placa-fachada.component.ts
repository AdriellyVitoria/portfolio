import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconeCafeComponent } from './icone-cafe.component';

/** Placa principal da fachada: madeira entalhada, com relevo e pregos nos cantos. */
@Component({
  selector: 'app-placa-fachada',
  imports: [IconeCafeComponent],
  template: `
    <div class="placa">
      <p class="placa__titulo">{{ titulo() }}</p>
      <p class="placa__sub">
        <app-icone-cafe icone="livro" [tamanho]="16" />
        <span>{{ subtitulo() }}</span>
        <app-icone-cafe icone="flor" [tamanho]="16" />
        <app-icone-cafe icone="xicara" [tamanho]="16" />
      </p>
    </div>
  `,
  styleUrl: './placa-fachada.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacaFachadaComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
}
