import { PerspectiveCamera } from 'three';

import { type CallbacksInteracao, Interacao } from './interaction';

describe('Interacao (toque)', () => {
  function montar() {
    const canvas = document.createElement('canvas');
    const callbacks: CallbacksInteracao = {
      aoSelecionar: vi.fn(),
      aoPassar: vi.fn(),
      aoArrastar: vi.fn(),
      aoSoltar: vi.fn(),
    };
    const interacao = new Interacao(canvas, new PerspectiveCamera(), callbacks);
    // jsdom não tem PointerEvent: um MouseEvent com pointerId serve.
    const ponteiro = (tipo: string, id: number, x: number, y = 0) => {
      const e = new MouseEvent(tipo, { clientX: x, clientY: y });
      Object.assign(e, { pointerId: id, pointerType: 'touch' });
      canvas.dispatchEvent(e);
    };
    return { interacao, callbacks, ponteiro };
  }

  it('arrastar um dedo gira a câmera', () => {
    const { callbacks, ponteiro } = montar();
    ponteiro('pointerdown', 1, 0);
    ponteiro('pointermove', 1, 20);
    ponteiro('pointermove', 1, 30);
    ponteiro('pointerup', 1, 30);

    expect(callbacks.aoArrastar).toHaveBeenCalledWith(10, 0);
    expect(callbacks.aoSoltar).toHaveBeenCalledTimes(1);
  });

  it('um segundo dedo (pinça) encerra o arrasto e os dedos não giram mais a câmera', () => {
    const { callbacks, ponteiro } = montar();
    ponteiro('pointerdown', 1, 0);
    ponteiro('pointermove', 1, 20);
    ponteiro('pointerdown', 2, 100);
    vi.mocked(callbacks.aoArrastar).mockClear();

    ponteiro('pointermove', 2, 160);
    ponteiro('pointermove', 1, 80);
    ponteiro('pointerup', 1, 80);
    ponteiro('pointerup', 2, 160);

    expect(callbacks.aoArrastar).not.toHaveBeenCalled();
    expect(callbacks.aoSoltar).toHaveBeenCalledTimes(1);
    expect(callbacks.aoSelecionar).not.toHaveBeenCalled();
  });

  it('depois de soltar todos os dedos, um novo toque funciona', () => {
    const { callbacks, ponteiro } = montar();
    ponteiro('pointerdown', 1, 0);
    ponteiro('pointerdown', 2, 50);
    ponteiro('pointerup', 1, 0);
    ponteiro('pointerup', 2, 50);

    ponteiro('pointerdown', 3, 0);
    ponteiro('pointermove', 3, 30);

    expect(callbacks.aoArrastar).toHaveBeenCalledWith(30, 0);
  });
});
