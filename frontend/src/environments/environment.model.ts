// Fica separado porque environment.ts é substituído por environment.development.ts
// no build de desenvolvimento (fileReplacements).
import type { FonteDados } from '../app/core/data/provide-dados';

export interface Environment {
  producao: boolean;
  fonteDados: FonteDados;
  /** Atraso artificial dos dados locais (ms), para ver os estados de carregamento. */
  latenciaSimuladaMs: number;
  apiUrl: string;
}
