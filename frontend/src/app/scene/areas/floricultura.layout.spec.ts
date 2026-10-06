import { CATEGORIAS_SKILL, type CategoriaSkill } from '../../core/models';
import { ESTANTE, andaresDaEstante, disporCanteiros } from './floricultura.layout';

describe('disporCanteiros', () => {
  const todas = CATEGORIAS_SKILL.map((c) => c.id);

  it('IA no centro, maior; as outras três de cada lado', () => {
    const posicoes = disporCanteiros(todas);
    const lado = (l: string) => posicoes.filter((p) => p.lado === l).map((p) => p.categoria);

    expect(posicoes).toHaveLength(todas.length);
    expect(lado('centro')).toEqual(['IA']);
    expect(lado('esquerda')).toHaveLength(3);
    expect(lado('direita')).toHaveLength(3);
    const ia = posicoes.find((p) => p.categoria === 'IA')!;
    expect(ia.escala).toBeGreaterThan(ESTANTE.escalaVaso);
    expect(andaresDaEstante(posicoes)).toBe(3);
  });

  it('estante esquerda à esquerda, direita à direita, e a primeira categoria no andar de cima', () => {
    const posicoes = disporCanteiros(todas);
    const esquerda = posicoes.filter((p) => p.lado === 'esquerda');

    for (const p of posicoes) {
      if (p.lado === 'esquerda') expect(p.base.x).toBeLessThan(0);
      if (p.lado === 'direita') expect(p.base.x).toBeGreaterThan(0);
    }
    // Ordem do currículo de cima para baixo.
    const alturas = esquerda.map((p) => p.base.y);
    expect(alturas).toEqual([...alturas].sort((a, b) => b - a));
    expect(esquerda[0].categoria).toBe(todas.find((c) => c !== 'IA'));
  });

  it('sem IA, a categoria que sobra (ímpar) vai para o centro', () => {
    const tres: CategoriaSkill[] = ['FRONTEND', 'BACKEND', 'DEVOPS'];
    const posicoes = disporCanteiros(tres);

    expect(posicoes.find((p) => p.lado === 'centro')?.categoria).toBe('DEVOPS');
    expect(disporCanteiros([])).toEqual([]);
  });
});
