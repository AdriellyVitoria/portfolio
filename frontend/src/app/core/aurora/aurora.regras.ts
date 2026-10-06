import type { Acao } from '../models';

/** Perguntas sugeridas ao abrir a conversa (e quando a Aurora não entende). */
export const SUGESTOES_INICIAIS = [
  'Quais projetos usam Java?',
  'Onde a Adrielly trabalha?',
  'Ela trabalha com IA?',
  'Como entro em contato?',
];

/** A resposta leva o visitante para fora do café? Se sim, o chat recolhe. */
export function saiDoCafe(acoes: readonly Acao[]): boolean {
  return acoes.some((a) => a.tipo === 'NAVEGAR' && a.destino !== 'cafe' && a.destino !== 'aurora');
}
