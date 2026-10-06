import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { SceneBridgeService } from '../../scene/scene-bridge.service';

/**
 * Prende o elemento à âncora de mesmo id na cena 3D (`appRotuloCena="secao-livraria"`).
 * Depois de registrado, quem posiciona o elemento é a cena, a cada frame.
 */
@Directive({ selector: '[appRotuloCena]' })
export class RotuloCenaDirective {
  readonly appRotuloCena = input.required<string>();

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const ponte = inject(SceneBridgeService);

    afterNextRender(() => ponte.registrarRotulo(this.appRotuloCena(), elemento));
    inject(DestroyRef).onDestroy(() => ponte.removerRotulo(this.appRotuloCena()));
  }
}
