import type { MeshStandardMaterial } from 'three';

import { PROJETOS_MOCK } from '../../core/data/mock/projetos.mock';
import { SKILLS_MOCK } from '../../core/data/mock/skills.mock';
import { alvoDe } from '../tipos';
import { CafeArea } from './cafe.area';
import { FloriculturaArea } from './floricultura.area';
import { LivrariaArea } from './livraria.area';

// As áreas são classes TS puras: dá para testar sem WebGL e sem Angular.
describe('áreas da cena', () => {
  beforeEach(() => {
    // jsdom não tem canvas 2D; as áreas funcionam sem as texturas de texto.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  describe('LivrariaArea', () => {
    const montar = () => {
      const livraria = new LivrariaArea();
      livraria.montar([...PROJETOS_MOCK]);
      return livraria;
    };
    const brilho = (livraria: LivrariaArea, id: string) =>
      (livraria.alvos.find((m) => alvoDe(m)?.id === id)!.material as MeshStandardMaterial)
        .emissiveIntensity;

    it('cria um livro clicável por projeto', () => {
      const livraria = montar();

      expect(livraria.alvos).toHaveLength(PROJETOS_MOCK.length);
      const porId = (x: { id: string }, y: { id: string }) => x.id.localeCompare(y.id);
      expect(livraria.alvos.map((m) => alvoDe(m)!).sort(porId)).toEqual(
        PROJETOS_MOCK.map((p) => ({ tipo: 'projeto', id: p.id, rotulo: p.nome })).sort(porId),
      );
    });

    it('acende só os livros destacados', () => {
      const livraria = montar();

      livraria.destacar(new Set(['projeto-exemplo-1']));
      for (let i = 0; i < 60; i++) livraria.update(1 / 60, i / 60);

      expect(brilho(livraria, 'projeto-exemplo-1')).toBeGreaterThan(0.7);
      expect(brilho(livraria, 'projeto-exemplo-4')).toBeLessThan(0.05);
    });

    it('remontar não duplica livros', () => {
      const livraria = montar();
      livraria.montar([...PROJETOS_MOCK].slice(0, 2));

      expect(livraria.alvos).toHaveLength(2);
    });
  });

  it('FloriculturaArea cria um vaso clicável por skill', () => {
    const floricultura = new FloriculturaArea();
    floricultura.montar([...SKILLS_MOCK]);

    const ids = new Set(floricultura.alvos.map((m) => alvoDe(m)?.id));
    expect(ids).toEqual(new Set(SKILLS_MOCK.map((s) => s.id)));
    expect(floricultura.grupo.getObjectByName('vaso__java')).toBeDefined();
  });

  it('CafeArea tem notebook, cardápio e pasta clicáveis', () => {
    const cafe = new CafeArea();

    const paineis = new Set(cafe.alvos.map((m) => alvoDe(m)?.id));
    expect(paineis).toEqual(new Set(['apresentacao', 'trajetoria', 'contato']));
  });
});
