import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import type { Perfil } from '../../core/models';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { TagComponent } from '../../shared/ui/tag.component';
import { MesAnoPipe } from '../../shared/utils/mes-ano.pipe';

/** Apresentação, objetivos, experiência e formação ("a mesa do café"). */
@Component({
  selector: 'app-sobre',
  imports: [MesAnoPipe, TagComponent],
  templateUrl: './sobre.component.html',
  styleUrl: './sobre.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SobreComponent {
  readonly perfil = input.required<Perfil>();
  /** No 3D, o notebook mostra a apresentação e o cardápio, a trajetória. */
  readonly mostrar = input<'tudo' | 'apresentacao' | 'trajetoria'>('tudo');

  protected readonly estado = inject(PortfolioStateService);
}
