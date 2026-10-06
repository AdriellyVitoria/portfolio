import { type MeshStandardMaterial, PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';

import { PROJETOS } from '../../core/data/local/projetos.dados';
import { SKILLS } from '../../core/data/local/skills.dados';
import { ESTACOES } from '../estacoes';
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
      livraria.montar([...PROJETOS]);
      return livraria;
    };
    const brilho = (livraria: LivrariaArea, id: string) =>
      (livraria.alvos.find((m) => alvoDe(m)?.id === id)!.material as MeshStandardMaterial)
        .emissiveIntensity;

    it('cria um livro clicável por projeto', () => {
      const livraria = montar();

      expect(livraria.alvos).toHaveLength(PROJETOS.length);
      const porId = (x: { id: string }, y: { id: string }) => x.id.localeCompare(y.id);
      expect(livraria.alvos.map((m) => alvoDe(m)!).sort(porId)).toEqual(
        PROJETOS.map((p) => ({ tipo: 'projeto', id: p.id, rotulo: p.nome })).sort(porId),
      );
    });

    it('acende só os livros destacados', () => {
      const livraria = montar();

      livraria.destacar(new Set(['assistente-pedidos-ia']));
      for (let i = 0; i < 60; i++) livraria.update(1 / 60, i / 60);

      expect(brilho(livraria, 'assistente-pedidos-ia')).toBeGreaterThan(0.7);
      expect(brilho(livraria, 'linketinder')).toBeLessThan(0.05);
    });

    it('remontar não duplica livros', () => {
      const livraria = montar();
      livraria.montar([...PROJETOS].slice(0, 2));

      expect(livraria.alvos).toHaveLength(2);
    });
  });

  it('FloriculturaArea cria um vaso clicável por categoria (não um por skill)', () => {
    const floricultura = new FloriculturaArea();
    floricultura.montar([...SKILLS]);

    const categorias = new Set(SKILLS.map((s) => s.categoria));
    expect(floricultura.alvos).toHaveLength(categorias.size);
    expect(new Set(floricultura.alvos.map((m) => alvoDe(m)?.id))).toEqual(categorias);
    expect(floricultura.alvos.every((m) => alvoDe(m)?.tipo === 'categoria')).toBe(true);
    expect(floricultura.grupo.getObjectByName('vaso__BACKEND')).toBeDefined();
  });

  it('CafeArea tem notebook, cardápio, pasta e o tablet da Aurora clicáveis', () => {
    const cafe = new CafeArea();

    const paineis = new Set(cafe.alvos.map((m) => alvoDe(m)?.id));
    expect(paineis).toEqual(new Set(['apresentacao', 'trajetoria', 'contato', 'aurora']));
  });

  it('da estação do balcão, o clique no centro do tablet chama a Aurora', () => {
    const cafe = new CafeArea();
    cafe.grupo.updateMatrixWorld(true);
    const camera = new PerspectiveCamera(50, 1280 / 800, 0.1, 80);
    camera.position.copy(ESTACOES.aurora.posicao);
    camera.lookAt(ESTACOES.aurora.alvo);
    camera.updateMatrixWorld();

    const tablet = cafe.grupo.getObjectByName('aurora__tablet')!;
    const centro = tablet.localToWorld(new Vector3(0, 0.3, 0)).project(camera);
    const raycaster = new Raycaster();
    raycaster.setFromCamera(new Vector2(centro.x, centro.y), camera);
    const [primeiro] = raycaster.intersectObjects(cafe.alvos, false);

    expect(alvoDe(primeiro?.object)).toEqual({
      tipo: 'aurora',
      id: 'aurora',
      rotulo: 'Tablet · Falar com a Aurora',
    });
  });

  it('na mesa do café, cada item recebe o próprio clique (um não tapa o outro)', () => {
    const cafe = new CafeArea();
    cafe.grupo.updateMatrixWorld(true);
    // Mesma câmera da estação do café.
    const camera = new PerspectiveCamera(50, 1280 / 800, 0.1, 80);
    camera.position.copy(ESTACOES.cafe.posicao);
    camera.lookAt(ESTACOES.cafe.alvo);
    camera.updateMatrixWorld();
    const raycaster = new Raycaster();

    const itens: [string, number][] = [
      ['apresentacao', 0.14], // notebook
      ['trajetoria', 0.14], // cardápio (fica atrás da pasta)
      ['contato', 0.03], // pasta
    ];
    for (const [id, alturaDoCentro] of itens) {
      const item = cafe.grupo.getObjectByName(`cafe__${id}`)!;
      const centro = item.localToWorld(new Vector3(0, alturaDoCentro, 0)).project(camera);
      raycaster.setFromCamera(new Vector2(centro.x, centro.y), camera);
      const [primeiro] = raycaster.intersectObjects(cafe.alvos, false);

      expect(alvoDe(primeiro?.object)?.id, `clique no centro de ${id}`).toBe(id);
    }
  });
});
