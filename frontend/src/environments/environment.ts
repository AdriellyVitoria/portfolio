export type FonteDados = 'mock' | 'http';

export const environment = {
  producao: true,
  // Trocar para 'http' quando o backend existir (plano.md §7).
  fonteDados: 'mock' as FonteDados,
  apiUrl: '',
};
