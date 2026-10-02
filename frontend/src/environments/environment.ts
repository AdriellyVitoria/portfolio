import type { Environment } from './environment.model';

export const environment: Environment = {
  producao: true,
  // Trocar para 'http' quando o backend existir (plano.md §7).
  fonteDados: 'mock',
  apiUrl: '',
};
