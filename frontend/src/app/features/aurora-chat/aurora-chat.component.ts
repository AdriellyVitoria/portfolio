import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { AuroraService } from '../../core/aurora/aurora.service';
import { MAX_CARACTERES_PERGUNTA } from '../../core/models';
import { TagComponent } from '../../shared/ui/tag.component';
import { AvatarAuroraComponent } from './avatar-aurora.component';

/**
 * Conversa com a Aurora.
 * `lateral`: painel do café 3D (não modal, com recolher e fechar; Esc recolhe).
 * `inline`: bloco dentro da seção Café do modo simples.
 */
@Component({
  selector: 'app-aurora-chat',
  imports: [AvatarAuroraComponent, TagComponent],
  templateUrl: './aurora-chat.component.html',
  styleUrl: './aurora-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"chat chat--" + variante()',
    '(keydown.escape)': 'aoEsc()',
  },
})
export class AuroraChatComponent {
  readonly variante = input<'lateral' | 'inline'>('lateral');

  protected readonly aurora = inject(AuroraService);
  protected readonly texto = signal('');
  protected readonly maximo = MAX_CARACTERES_PERGUNTA;

  private readonly lista = viewChild.required<ElementRef<HTMLElement>>('lista');
  private readonly campo = viewChild.required<ElementRef<HTMLInputElement>>('campo');

  constructor() {
    // Garante a boas-vindas. Quem abre o painel do café é a página 3D (sino ou HUD).
    this.aurora.cumprimentar();

    // Mensagem nova: rola a conversa até o fim.
    afterRenderEffect(() => {
      this.aurora.mensagens();
      this.aurora.digitando();
      const lista = this.lista().nativeElement;
      lista.scrollTop = lista.scrollHeight;
    });

    // No painel do café, o foco vai direto para o campo. Não no modo simples (não rouba o foco
    // da página) nem em telas de toque (o teclado subiria sozinho e taparia a cena).
    afterNextRender(() => {
      const toque = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      if (this.variante() === 'lateral' && !toque) this.campo().nativeElement.focus();
    });
  }

  protected digitar(evento: Event): void {
    this.texto.set((evento.target as HTMLInputElement).value);
  }

  protected enviar(texto = this.texto()): void {
    if (!texto.trim()) return;
    this.aurora.enviar(texto);
    this.texto.set('');
  }

  protected aoEsc(): void {
    if (this.variante() === 'lateral') this.aurora.recolher();
  }
}
