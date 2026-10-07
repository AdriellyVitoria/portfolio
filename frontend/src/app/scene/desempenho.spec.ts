import { MonitorDesempenho } from './desempenho';

describe('MonitorDesempenho', () => {
  const opcoes = { janela: 1, aquecimento: 1, fpsMinimo: 30, janelasLentas: 2 };

  /** Simula `segundos` de frames a um FPS constante e devolve as decisões tomadas. */
  function rodar(monitor: MonitorDesempenho, fps: number, segundos: number) {
    const decisoes = [];
    for (let i = 0; i < Math.round(fps * segundos); i++) {
      const d = monitor.registrar(1 / fps);
      if (d && d !== 'manter') decisoes.push(d);
    }
    return decisoes;
  }

  it('não faz nada com FPS bom e mede o FPS', () => {
    const monitor = new MonitorDesempenho('alta', opcoes);

    expect(rodar(monitor, 60, 10)).toEqual([]);
    expect(monitor.nivel).toBe('alta');
    expect(monitor.fps).toBeCloseTo(60, 0);
  });

  it('ignora o aquecimento e um engasgo isolado', () => {
    const monitor = new MonitorDesempenho('alta', opcoes);

    expect(rodar(monitor, 10, 1)).toEqual([]); // aquecimento
    rodar(monitor, 60, 2);
    expect(rodar(monitor, 15, 1)).toEqual([]); // uma janela lenta só
    rodar(monitor, 60, 2);
    expect(monitor.nivel).toBe('alta');
  });

  it('baixa um nível por vez com lentidão seguida, e no mais baixo avisa uma vez', () => {
    const monitor = new MonitorDesempenho('alta', opcoes);

    expect(rodar(monitor, 15, 3.5)).toEqual(['baixar']);
    expect(monitor.nivel).toBe('media');
    expect(rodar(monitor, 15, 3.5)).toEqual(['baixar']);
    expect(monitor.nivel).toBe('baixa');
    expect(rodar(monitor, 15, 10)).toEqual(['lento-demais']);
  });

  it('uma pausa longa (aba escondida) não conta como lentidão e recomeça o aquecimento', () => {
    const monitor = new MonitorDesempenho('alta', opcoes);
    rodar(monitor, 60, 2);

    expect(monitor.registrar(5)).toBeNull();
    expect(monitor.registrar(0.5)).toBeNull(); // de volta ao aquecimento
    expect(rodar(monitor, 60, 5)).toEqual([]);
    expect(monitor.nivel).toBe('alta');
  });
});
