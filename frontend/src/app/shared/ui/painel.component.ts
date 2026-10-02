import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  input,
  output,
  viewChild,
} from '@angular/core';

let proximoId = 0;

/**
 * Painel modal sobre o conteúdo (e, depois, sobre a cena 3D).
 * Usa `<dialog>` nativo: prende o foco, fecha com Esc e devolve o foco ao sair.
 * Abre ao ser criado; quem usa controla a existência com `@if`.
 */
@Component({
  selector: 'app-painel',
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PainelComponent {
  readonly titulo = input.required<string>();
  readonly fechar = output<void>();

  protected readonly idTitulo = `painel-titulo-${proximoId++}`;
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // showModal só existe no navegador; no prerender o dialog fica fechado no HTML.
    afterNextRender(() => {
      const dialogo = this.dialogo().nativeElement;
      if (typeof dialogo.showModal === 'function') {
        dialogo.showModal();
      } else {
        dialogo.setAttribute('open', ''); // ambientes sem suporte (ex.: jsdom nos testes)
      }
    });
  }

  protected fecharDialogo(): void {
    const dialogo = this.dialogo().nativeElement;
    if (typeof dialogo.close === 'function') {
      dialogo.close();
    } else {
      dialogo.removeAttribute('open');
      this.fechar.emit();
    }
  }

  /** Clique no fundo escurecido (o próprio <dialog>, fora do conteúdo) fecha. */
  protected aoClicar(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) {
      this.fecharDialogo();
    }
  }
}
