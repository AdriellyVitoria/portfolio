import { InjectionToken, Injectable, Injector, inject } from '@angular/core';
import { pendingUntilEvent } from '@angular/core/rxjs-interop';
import { type Observable, delay, of } from 'rxjs';

import type { PedidoChat, RespostaChat } from '../../models';
import { ChatRepository } from '../chat.repository';
import { responderLocalmente } from './aurora.respostas';
import { PERFIL } from './perfil.dados';
import { PROJETOS } from './projetos.dados';
import { SKILLS } from './skills.dados';

/** Tempo de "digitando…" das respostas locais. Nos testes, 0. */
export const ATRASO_RESPOSTA_AURORA_MS = new InjectionToken<number>('ATRASO_RESPOSTA_AURORA_MS', {
  factory: () => 650,
});

/** Aurora sem backend: responde com regras locais sobre os dados reais. */
@Injectable()
export class ChatLocalRepository extends ChatRepository {
  private readonly atraso = inject(ATRASO_RESPOSTA_AURORA_MS);
  private readonly injector = inject(Injector);

  enviar(pedido: PedidoChat): Observable<RespostaChat> {
    const resposta = responderLocalmente(pedido.mensagem, {
      projetos: PROJETOS,
      skills: SKILLS,
      perfil: PERFIL,
    });
    return this.atraso > 0
      ? of(resposta).pipe(delay(this.atraso), pendingUntilEvent(this.injector))
      : of(resposta);
  }
}
