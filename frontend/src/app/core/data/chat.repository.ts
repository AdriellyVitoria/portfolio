import type { Observable } from 'rxjs';

import type { PedidoChat, RespostaChat } from '../models';

/** Implementação local (respostas pré-definidas) na fase 3; HTTP (Gemini via backend) depois. */
export abstract class ChatRepository {
  abstract enviar(pedido: PedidoChat): Observable<RespostaChat>;
}
