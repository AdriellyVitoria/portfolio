import type { Observable } from 'rxjs';

import type { PedidoChat, RespostaChat } from '../models';

/** Implementação mock na fase 3; HTTP (Gemini via backend) depois. */
export abstract class ChatRepository {
  abstract enviar(pedido: PedidoChat): Observable<RespostaChat>;
}
