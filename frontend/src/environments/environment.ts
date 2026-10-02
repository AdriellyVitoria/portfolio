import type { Environment } from './environment.model';

export const environment: Environment = {
  producao: true,
  // Trocar para 'http' quando o backend existir.
  fonteDados: 'mock',
  latenciaMockMs: 0,
  apiUrl: '',
};
