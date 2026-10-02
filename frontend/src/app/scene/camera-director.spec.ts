import { PerspectiveCamera, Vector3 } from 'three';

import { CameraDirector } from './camera-director';
import { ESTACOES } from './estacoes';

describe('CameraDirector', () => {
  const simular = (director: CameraDirector, segundos: number) => {
    for (let t = 0; t < segundos; t += 1 / 60) director.update(1 / 60);
  };

  it('posiciona a câmera na estação sem animação', () => {
    const camera = new PerspectiveCamera();
    const director = new CameraDirector(camera, false);

    director.posicionar(ESTACOES.livraria);

    expect(camera.position.distanceTo(ESTACOES.livraria.posicao)).toBeLessThan(1e-6);
  });

  it('anima até a próxima estação e chega ao destino', () => {
    const camera = new PerspectiveCamera();
    const director = new CameraDirector(camera, false);
    director.posicionar(ESTACOES.entrada);

    director.irPara(ESTACOES.cafe);
    director.update(0.1);
    expect(director.emTransicao).toBe(true);
    expect(camera.position.distanceTo(ESTACOES.cafe.posicao)).toBeGreaterThan(0.5);

    simular(director, 2);
    expect(director.emTransicao).toBe(false);
    expect(camera.position.distanceTo(ESTACOES.cafe.posicao)).toBeLessThan(1e-3);
  });

  it('com movimento reduzido, troca de estação na hora', () => {
    const camera = new PerspectiveCamera();
    const director = new CameraDirector(camera, true);
    director.posicionar(ESTACOES.entrada);

    director.irPara(ESTACOES.floricultura);

    expect(director.emTransicao).toBe(false);
    expect(camera.position.distanceTo(ESTACOES.floricultura.posicao)).toBeLessThan(1e-6);
  });

  it('o arrasto gira a câmera com limite e volta ao enquadramento ao soltar', () => {
    const camera = new PerspectiveCamera();
    const director = new CameraDirector(camera, false);
    director.posicionar(ESTACOES.livraria);
    const original = camera.position.clone();

    director.arrastar(5000, 0); // muito além do limite
    director.update(1 / 60);
    const girada = camera.position.clone();
    expect(girada.distanceTo(original)).toBeGreaterThan(0.1);
    // A distância até o alvo não muda: é uma rotação em volta dele.
    expect(girada.distanceTo(director.alvo)).toBeCloseTo(original.distanceTo(director.alvo), 5);
    // Limite: arrastar mais não gira mais.
    director.arrastar(5000, 0);
    director.update(1 / 60);
    expect(camera.position.distanceTo(girada)).toBeLessThan(1e-6);

    director.soltar();
    simular(director, 4);
    expect(camera.position.distanceTo(original)).toBeLessThan(0.01);
  });

  it('todas as estações olham para um ponto diferente da posição', () => {
    Object.values(ESTACOES).forEach(({ posicao, alvo }) =>
      expect(posicao.distanceTo(alvo as Vector3)).toBeGreaterThan(1),
    );
  });
});
