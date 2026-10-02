import { ChangeDetectionStrategy, Component } from '@angular/core';

// Página provisória: valida tokens, fontes e deploy (fase 0).
// O conteúdo real do modo simples entra na fase 2.
@Component({
  selector: 'app-modo-simples',
  templateUrl: './modo-simples.page.html',
  styleUrl: './modo-simples.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ModoSimplesPage {
  protected readonly paleta = [
    'terracota',
    'laranja',
    'amarelo',
    'verde',
    'marrom',
    'creme',
    'rosa',
    'lilas',
  ];
}
