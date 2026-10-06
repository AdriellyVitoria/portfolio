import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type IconeCafe, IconeCafeComponent } from './icone-cafe.component';

/** Placa de seção pendurada por cordas (Livraria, Floricultura, Café). Balança no hover. */
@Component({
  selector: 'app-placa-secao',
  imports: [IconeCafeComponent],
  template: `
    <div class="placa">
      <span class="placa__icone"><app-icone-cafe [icone]="icone()" [tamanho]="26" /></span>
      <span class="placa__textos">
        <span class="placa__titulo">{{ titulo() }}</span>
        <span class="placa__sub">{{ subtitulo() }}</span>
      </span>
    </div>
  `,
  styleUrl: './placa-secao.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacaSecaoComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
  readonly icone = input.required<IconeCafe>();
}
