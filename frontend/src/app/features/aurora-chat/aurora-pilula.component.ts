import { ChangeDetectionStrategy, Component, output } from '@angular/core';

import { AvatarAuroraComponent } from './avatar-aurora.component';

/** Atalho para voltar a uma conversa recolhida (aparece fora do café). */
@Component({
  selector: 'app-aurora-pilula',
  imports: [AvatarAuroraComponent],
  template: `
    <button type="button" class="pilula" (click)="voltar.emit()">
      <app-avatar-aurora [tamanho]="28" />
      <span>Aurora · voltar à conversa</span>
    </button>
  `,
  styles: `
    .pilula {
      display: inline-flex;
      align-items: center;
      gap: var(--esp-2);
      min-height: 44px;
      padding: var(--esp-1) var(--esp-4) var(--esp-1) var(--esp-1);
      border: 1px solid var(--borda);
      border-radius: var(--raio-pill);
      background: var(--superficie);
      box-shadow: var(--sombra-md);
      color: var(--texto);
      font: inherit;
      font-size: var(--texto-sm);
      font-weight: 600;
      cursor: pointer;
    }
    .pilula:hover {
      border-color: var(--acao);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuroraPilulaComponent {
  readonly voltar = output<void>();
}
