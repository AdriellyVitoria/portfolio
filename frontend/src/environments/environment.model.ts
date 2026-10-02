// Fica separado porque environment.ts é substituído por environment.development.ts
// no build de desenvolvimento (fileReplacements).
export type FonteDados = 'mock' | 'http';

export interface Environment {
  producao: boolean;
  fonteDados: FonteDados;
  apiUrl: string;
}
