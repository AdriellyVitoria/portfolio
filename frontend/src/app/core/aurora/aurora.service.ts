import { Injectable, computed, inject, signal } from '@angular/core';

import { ChatRepository } from '../data/chat.repository';
import { MAX_CARACTERES_PERGUNTA, type MensagemChat } from '../models';
import { AcaoExecutorService } from './acao-executor.service';
import { SUGESTOES_INICIAIS, saiDoCafe } from './aurora.regras';

export interface MensagemAurora extends MensagemChat {
  id: number;
  sugestoes?: string[];
}

const TAMANHO_HISTORICO = 10;

/**
 * Estado da conversa com a Aurora, compartilhado pelo café 3D e pelo modo simples.
 * Fica só em memória (nada é salvo no navegador).
 *
 * `aberta`: a conversa começou. `recolhida`: uma ação levou o visitante para fora do
 * café; o painel some e fica só o atalho "voltar à conversa".
 */
@Injectable({ providedIn: 'root' })
export class AuroraService {
  private readonly chat = inject(ChatRepository);
  private readonly executor = inject(AcaoExecutorService);

  private readonly _mensagens = signal<MensagemAurora[]>([]);
  private readonly _digitando = signal(false);
  private readonly _aberta = signal(false);
  private readonly _recolhida = signal(false);
  private proximoId = 0;

  readonly mensagens = this._mensagens.asReadonly();
  readonly digitando = this._digitando.asReadonly();
  readonly aberta = this._aberta.asReadonly();
  readonly recolhida = this._recolhida.asReadonly();
  /** Sugestões da última fala da Aurora (somem quando o visitante responde). */
  readonly sugestoes = computed(() => {
    const ultima = this._mensagens().at(-1);
    return ultima?.autor === 'AURORA' ? (ultima.sugestoes ?? []) : [];
  });

  /** Garante a mensagem de boas-vindas (sem abrir o painel do café). */
  cumprimentar(): void {
    if (!this._mensagens().length) {
      this.adicionar({
        autor: 'AURORA',
        texto:
          'Olá! Eu sou a Aurora, guia deste café. Pergunte sobre os projetos, as tecnologias ou a trajetória da Adrielly, e eu te levo até lá.',
        sugestoes: SUGESTOES_INICIAIS,
      });
    }
  }

  /** O visitante chamou a Aurora no café. */
  abrir(): void {
    this._aberta.set(true);
    this._recolhida.set(false);
    this.cumprimentar();
  }

  recolher(): void {
    if (this._aberta()) this._recolhida.set(true);
  }

  voltar(): void {
    this._recolhida.set(false);
  }

  fechar(): void {
    this._aberta.set(false);
    this._recolhida.set(false);
  }

  enviar(texto: string): void {
    const pergunta = texto.trim().slice(0, MAX_CARACTERES_PERGUNTA);
    if (!pergunta || this._digitando()) return;

    const historico = this._mensagens()
      .slice(-TAMANHO_HISTORICO)
      .map(({ autor, texto }) => ({ autor, texto }));
    this.adicionar({ autor: 'USUARIO', texto: pergunta });
    this._digitando.set(true);

    this.chat.enviar({ mensagem: pergunta, historico }).subscribe({
      next: (resposta) => {
        this.adicionar({
          autor: 'AURORA',
          texto: resposta.mensagem,
          sugestoes: resposta.sugestoes,
        });
        this.executor.executar(resposta.acoes);
        if (saiDoCafe(resposta.acoes)) {
          this._recolhida.set(true);
        }
      },
      error: () => {
        this.adicionar({
          autor: 'AURORA',
          texto: 'Tive um probleminha para responder agora. Pode tentar de novo em instantes?',
        });
        this._digitando.set(false);
      },
      complete: () => this._digitando.set(false),
    });
  }

  private adicionar(mensagem: Omit<MensagemAurora, 'id'>): void {
    this._mensagens.update((lista) => [...lista, { ...mensagem, id: this.proximoId++ }]);
  }
}
