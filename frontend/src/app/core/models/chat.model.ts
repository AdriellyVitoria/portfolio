import type { Area } from './area.model';

export type AutorMensagem = 'USUARIO' | 'AURORA';

export interface MensagemChat {
  autor: AutorMensagem;
  texto: string;
}

export interface PedidoChat {
  mensagem: string;
  /** Histórico curto; o backend limita o tamanho. */
  historico: MensagemChat[];
}

/**
 * Ações que a Aurora pode disparar na interface.
 * União discriminada: o `switch (acao.tipo)` fica checado pelo compilador.
 */
export type Acao =
  | { tipo: 'NAVEGAR'; destino: Area }
  /** `tecnologia` aceita id ou nome da skill (ex.: 'java' ou 'Java'). */
  | { tipo: 'DESTACAR_PROJETOS'; tecnologia: string }
  | { tipo: 'ABRIR_PROJETO'; projetoId: string }
  | { tipo: 'LIMPAR_DESTAQUE' };

export type TipoAcao = Acao['tipo'];

export interface RespostaChat {
  mensagem: string;
  acoes: Acao[];
}
