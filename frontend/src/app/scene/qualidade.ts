export type NivelQualidade = 'alta' | 'media' | 'baixa';

export interface ConfigQualidade {
  nivel: NivelQualidade;
  pixelRatioMaximo: number;
  sombras: boolean;
  folhas: number;
  antialias: boolean;
}

const CONFIGS: Record<NivelQualidade, ConfigQualidade> = {
  alta: { nivel: 'alta', pixelRatioMaximo: 2, sombras: true, folhas: 220, antialias: true },
  media: { nivel: 'media', pixelRatioMaximo: 1.5, sombras: true, folhas: 120, antialias: true },
  baixa: { nivel: 'baixa', pixelRatioMaximo: 1, sombras: false, folhas: 50, antialias: false },
};

export function configDe(nivel: NivelQualidade): ConfigQualidade {
  return CONFIGS[nivel];
}

/**
 * Palpite inicial de qualidade. Celulares (toque) e máquinas com poucos núcleos
 * começam em "média". Depois, o FPS medido (MonitorDesempenho) pode baixar o nível.
 */
export function detectarQualidade(): ConfigQualidade {
  if (typeof window === 'undefined') {
    return CONFIGS.media;
  }
  const toque = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const nucleos = navigator.hardwareConcurrency ?? 8;
  if (nucleos <= 2) return CONFIGS.baixa;
  if (toque || nucleos <= 4) return CONFIGS.media;
  return CONFIGS.alta;
}

export function suportaWebGL(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function prefereMenosMovimento(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  );
}
