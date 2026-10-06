import { PerspectiveCamera, Vector3 } from 'three';

import { type AncoraRotulo, RotulosCena } from './rotulos';

describe('RotulosCena', () => {
  // Câmera na origem olhando para -z, tela 1000x500.
  const camera = new PerspectiveCamera(50, 2, 0.1, 100);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, -1);
  camera.updateMatrixWorld();

  const ancora = (parcial: Partial<AncoraRotulo> = {}): AncoraRotulo => ({
    id: 'placa',
    posicao: new Vector3(0, 0, -5),
    alinhamento: 'base',
    areas: ['livraria'],
    distanciaReferencia: 5,
    ...parcial,
  });

  function montar(a: AncoraRotulo, area: 'livraria' | 'entrada' = 'livraria') {
    const rotulos = new RotulosCena();
    const elemento = document.createElement('button');
    rotulos.registrar(a.id, elemento);
    rotulos.definirAncoras([a]);
    rotulos.definirArea(area);
    rotulos.atualizar(camera, 1000, 500);
    return elemento;
  }

  it('posiciona o rótulo no ponto projetado da âncora e o mostra', () => {
    const elemento = montar(ancora());

    expect(elemento.style.opacity).toBe('1');
    // Centro da tela, encostado pela base, no tamanho natural (na distância de referência).
    expect(elemento.style.transform).toBe(
      'translate3d(500.0px, 250.0px, 0) translate(-50%, -100%) scale(0.781)',
    );
  });

  it('encolhe com a distância', () => {
    const perto = montar(ancora({ posicao: new Vector3(0, 0, -5) }));
    const longe = montar(ancora({ posicao: new Vector3(0, 0, -10) }));

    const escala = (el: HTMLElement) => Number(/scale\(([\d.]+)\)/.exec(el.style.transform)![1]);
    expect(escala(longe)).toBeLessThan(escala(perto));
  });

  it('esconde quando a âncora está atrás da câmera (e tira do teclado)', () => {
    const elemento = montar(ancora({ posicao: new Vector3(0, 0, 5) }));

    expect(elemento.style.opacity).toBe('0');
    expect(elemento.getAttribute('aria-hidden')).toBe('true');
    expect(elemento.getAttribute('tabindex')).toBe('-1');
  });

  it('esconde fora das estações em que o rótulo deve aparecer', () => {
    const elemento = montar(ancora({ areas: ['livraria'] }), 'entrada');

    expect(elemento.style.opacity).toBe('0');
  });

  it('volta a mostrar quando a estação muda', () => {
    const rotulos = new RotulosCena();
    const elemento = document.createElement('button');
    rotulos.registrar('placa', elemento);
    rotulos.definirAncoras([ancora()]);
    rotulos.definirArea('entrada');
    rotulos.atualizar(camera, 1000, 500);
    expect(elemento.style.opacity).toBe('0');

    rotulos.definirArea('livraria');
    rotulos.atualizar(camera, 1000, 500);

    expect(elemento.style.opacity).toBe('1');
    expect(elemento.hasAttribute('tabindex')).toBe(false);
  });

  it('ignora elementos sem âncora e âncoras sem elemento', () => {
    const rotulos = new RotulosCena();
    const solto = document.createElement('div');
    rotulos.registrar('sem-ancora', solto);
    rotulos.definirAncoras([ancora({ id: 'sem-elemento' })]);
    rotulos.definirArea('livraria');

    expect(() => rotulos.atualizar(camera, 1000, 500)).not.toThrow();
    expect(solto.style.opacity).toBe('0');
  });
});
