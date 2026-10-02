import type { Environment } from './environment.model';

export const environment: Environment = {
  producao: true,
  // Trocar para 'http' quando o backend existir.
  fonteDados: 'local',
  latenciaSimuladaMs: 0,
  apiUrl: '',
};
