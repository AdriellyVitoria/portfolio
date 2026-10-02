// Fica separado porque environment.ts é substituído por environment.development.ts
// no build de desenvolvimento (fileReplacements).
import type { FonteDados } from '../app/core/data/provide-dados';

export interface Environment {
  producao: boolean;
  fonteDados: FonteDados;
  /** Atraso artificial dos mocks (ms), para ver os estados de carregamento. */
  latenciaMockMs: number;
  apiUrl: string;
}
