import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterOutlet } from '@angular/router';

import { PerfilRepository } from '../../core/data/perfil.repository';
import { SeoService } from '../../core/seo/seo.service';
import { BotaoComponent } from '../../shared/ui/botao.component';
import { ContatoComponent } from '../cafe/contato.component';
import { SobreComponent } from '../cafe/sobre.component';
import { SkillsComponent } from '../floricultura/skills.component';
import { ListaProjetosComponent } from '../livraria/lista-projetos.component';

/**
 * Versão 2D do portfólio: para quem tem pressa, acessibilidade, SEO e fallback do 3D.
 * Usa os mesmos dados e o mesmo estado que a experiência 3D.
 * Os ids das seções seguem as áreas (`livraria`, `floricultura`, `cafe`).
 */
@Component({
  selector: 'app-modo-simples',
  imports: [
    RouterLink,
    RouterOutlet,
    BotaoComponent,
    ContatoComponent,
    ListaProjetosComponent,
    SkillsComponent,
    SobreComponent,
  ],
  templateUrl: './modo-simples.page.html',
  styleUrl: './modo-simples.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ModoSimplesPage {
  protected readonly perfil = toSignal(inject(PerfilRepository).obter());
  protected readonly anoAtual = new Date().getFullYear();

  constructor() {
    inject(SeoService).atualizar();
  }
}
