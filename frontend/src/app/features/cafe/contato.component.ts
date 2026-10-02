import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { Perfil, TipoLink } from '../../core/models';
import { BotaoComponent } from '../../shared/ui/botao.component';
import { type Icone, IconeLinkComponent } from '../../shared/ui/icone-link.component';

const ICONE_POR_LINK: Record<TipoLink, Icone> = {
  GITHUB: 'github',
  LINKEDIN: 'linkedin',
  EMAIL: 'email',
  OUTRO: 'link',
};

/** Links de contato e currículo ("a pasta sobre a mesa"). */
@Component({
  selector: 'app-contato',
  imports: [BotaoComponent, IconeLinkComponent],
  template: `
    <ul class="links">
      @for (link of links(); track link.url) {
        <li><app-icone-link [url]="link.url" [rotulo]="link.rotulo" [icone]="link.icone" /></li>
      }
    </ul>
    @if (perfil().placeholder) {
      <p class="aviso">Currículo em PDF em breve.</p>
    } @else {
      <a app-botao [href]="perfil().curriculoUrl" download>Baixar currículo (PDF)</a>
    }
  `,
  styles: `
    :host {
      display: grid;
      justify-items: start;
      gap: var(--esp-6);
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--esp-6);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .aviso {
      color: var(--texto-suave);
      font-style: italic;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContatoComponent {
  readonly perfil = input.required<Perfil>();

  protected readonly links = computed(() =>
    this.perfil().links.map((link) => ({ ...link, icone: ICONE_POR_LINK[link.tipo] })),
  );
}
