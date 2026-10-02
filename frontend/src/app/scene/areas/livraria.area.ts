import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  MathUtils,
  type Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  PointLight,
} from 'three';

import type { Projeto } from '../../core/models';
import { PALETA, corDaCapa } from '../paleta';
import type { ParteCena } from '../tipos';
import {
  caixa,
  descartar,
  fundirEstaticos,
  marcarDinamico,
  marcarInterativo,
  materialFosco,
  texturaDeTexto,
} from '../util';

// Estante encostada na parede do fundo.
const ESTANTE_X = -5.2;
const ESTANTE_Z = -4.75;
const LARGURA = 3.6;
const PROFUNDIDADE = 0.45;
const ALTURAS_PRATELEIRAS = [0.08, 0.62, 1.16, 1.7, 2.24, 2.78];
/** Prateleira na altura dos olhos: recebe os projetos em destaque. */
const NIVEL_DESTAQUE = 2;
const CORES_ENFEITE = [
  PALETA.marrom,
  PALETA.verdeEscuro,
  PALETA.creme,
  0x7a4b3a,
  0x8d6e4f,
  0x56604a,
];

interface Livro {
  id: string;
  mesh: Mesh;
  material: MeshStandardMaterial;
  zBase: number;
  saida: number;
  brilho: number;
}

/**
 * Estante de projetos: um livro por projeto, gerado a partir dos dados.
 * Novos projetos aparecem sem precisar abrir o Blender.
 */
export class LivrariaArea implements ParteCena {
  readonly grupo = new Group();
  private readonly livrosGrupo = marcarDinamico(new Group());
  private livros: Livro[] = [];
  private destacados = new Set<string>();
  private selecionado: string | null = null;
  private enfeitesPendentes: { matriz: Matrix4; cor: number }[] = [];
  private readonly auxiliar = new Object3D();

  constructor() {
    this.grupo.name = 'livraria';
    this.grupo.position.set(ESTANTE_X, 0, ESTANTE_Z);
    this.montarEstante();
    fundirEstaticos(this.grupo);
    this.grupo.add(this.livrosGrupo);
  }

  /** Meshes clicáveis (um por projeto). */
  get alvos(): Mesh[] {
    return this.livros.map((l) => l.mesh);
  }

  montar(projetos: Projeto[]): void {
    descartar(this.livrosGrupo);
    this.livrosGrupo.clear();
    this.livros = [];

    const destaques = projetos.filter((p) => p.destaque);
    const demais = projetos.filter((p) => !p.destaque);
    // Os demais se dividem entre a prateleira de baixo e a de cima do destaque.
    const porNivel = new Map<number, Projeto[]>([
      [NIVEL_DESTAQUE, destaques],
      [NIVEL_DESTAQUE - 1, demais.filter((_, i) => i % 2 === 0)],
      [NIVEL_DESTAQUE + 1, demais.filter((_, i) => i % 2 === 1)],
    ]);

    this.enfeitesPendentes = [];
    for (let nivel = 0; nivel < ALTURAS_PRATELEIRAS.length - 1; nivel++) {
      this.encherPrateleira(nivel, porNivel.get(nivel) ?? []);
    }

    // Todos os livros decorativos num único InstancedMesh: ~170 livros, 1 draw call.
    const enfeites = new InstancedMesh(
      new BoxGeometry(1, 1, 1),
      materialFosco(0xffffff),
      this.enfeitesPendentes.length,
    );
    const cor = new Color();
    this.enfeitesPendentes.forEach(({ matriz, cor: hex }, i) => {
      enfeites.setMatrixAt(i, matriz);
      enfeites.setColorAt(i, cor.setHex(hex));
    });
    enfeites.castShadow = true;
    enfeites.receiveShadow = true;
    this.livrosGrupo.add(enfeites);
  }

  destacar(ids: ReadonlySet<string>): void {
    this.destacados = new Set(ids);
  }

  selecionar(id: string | null): void {
    this.selecionado = id;
  }

  update(dt: number, tempo: number): void {
    const suavidade = 1 - Math.exp(-dt * 8);
    const filtroAtivo = this.destacados.size > 0;
    for (const [i, livro] of this.livros.entries()) {
      const destacado = this.destacados.has(livro.id);
      const selecionado = this.selecionado === livro.id;
      // Sem filtro, os livros de projeto pulsam de leve para convidar ao clique.
      const convite = filtroAtivo ? 0 : 0.12 + Math.sin(tempo * 2 + i) * 0.08;
      const saidaAlvo = selecionado ? 0.18 : destacado ? 0.13 : 0;
      const brilhoAlvo = selecionado ? 1 : destacado ? 0.85 : convite;
      livro.saida = MathUtils.lerp(livro.saida, saidaAlvo, suavidade);
      livro.brilho = MathUtils.lerp(livro.brilho, brilhoAlvo, suavidade);
      livro.mesh.position.z = livro.zBase + livro.saida;
      livro.material.emissiveIntensity = livro.brilho;
    }
  }

  private montarEstante(): void {
    const madeira = materialFosco(PALETA.madeira);
    const altura = ALTURAS_PRATELEIRAS.at(-1)!;
    this.grupo.add(
      caixa(0.08, altura, PROFUNDIDADE, madeira, -LARGURA / 2, altura / 2, 0),
      caixa(0.08, altura, PROFUNDIDADE, madeira, LARGURA / 2, altura / 2, 0),
      caixa(
        LARGURA,
        altura,
        0.04,
        materialFosco(PALETA.marromEscuro),
        0,
        altura / 2,
        -PROFUNDIDADE / 2,
      ),
    );
    ALTURAS_PRATELEIRAS.forEach((y) =>
      this.grupo.add(caixa(LARGURA + 0.08, 0.05, PROFUNDIDADE, madeira, 0, y, 0)),
    );

    // Prateleira especial: fita de luz quente logo acima dos livros em destaque.
    const yFita = ALTURAS_PRATELEIRAS[NIVEL_DESTAQUE + 1] - 0.04;
    const fita = caixa(
      LARGURA - 0.1,
      0.02,
      0.03,
      new MeshStandardMaterial({
        color: PALETA.luzQuente,
        emissive: PALETA.luzQuente,
        emissiveIntensity: 1.2,
      }),
      0,
      yFita,
      PROFUNDIDADE / 2 - 0.04,
    );
    fita.castShadow = false;
    const luz = new PointLight(PALETA.luzQuente, 2.2, 2.4, 1.5);
    luz.position.set(0, yFita - 0.1, 0.35);
    this.grupo.add(fita, luz);

    this.adicionarPlaca('Livraria · Projetos', 0, altura + 0.28, 1.9);
    this.adicionarPlaca(
      'Destaques',
      LARGURA / 2 - 0.45,
      ALTURAS_PRATELEIRAS[NIVEL_DESTAQUE] - 0.05,
      0.7,
      0.16,
    );
  }

  private adicionarPlaca(
    texto: string,
    x: number,
    y: number,
    largura: number,
    altura = 0.34,
  ): void {
    const textura = texturaDeTexto(texto, {
      largura: 512,
      altura: Math.round((512 * altura) / largura),
      fundo: '#3f5634',
      cor: '#f6ecdb',
      fonte: `600 ${Math.round(((512 * altura) / largura) * 0.55)}px "Fraunces Variable", Georgia, serif`,
    });
    if (!textura) return;
    const placa = new Mesh(
      new PlaneGeometry(largura, altura),
      new MeshStandardMaterial({ map: textura }),
    );
    placa.position.set(x, y, PROFUNDIDADE / 2 + 0.01);
    this.grupo.add(placa);
  }

  private encherPrateleira(nivel: number, projetos: Projeto[]): void {
    const base = ALTURAS_PRATELEIRAS[nivel] + 0.025;
    const limite = ALTURAS_PRATELEIRAS[nivel + 1] - base - 0.06;
    const inicio = -LARGURA / 2 + 0.08;
    const fim = LARGURA / 2 - 0.08;

    // Enfeites à esquerda, projetos no meio, enfeites até o fim.
    let x = inicio + (projetos.length ? 0.3 + Math.random() * 0.5 : 0);
    x = this.enfeites(inicio, x, base, limite);
    for (const projeto of projetos) {
      x = this.livroDeProjeto(projeto, x + 0.03, base, limite) + 0.03;
    }
    this.enfeites(x, fim, base, limite);
  }

  private livroDeProjeto(projeto: Projeto, x: number, base: number, limite: number): number {
    const espessura = 0.17;
    const altura = limite; // mais altos que os decorativos: se destacam na estante
    const material = new MeshStandardMaterial({
      color: corDaCapa(projeto.corCapa),
      emissive: new Color(PALETA.amarelo),
      emissiveIntensity: 0,
      roughness: 0.6,
      flatShading: true,
    });
    const mesh = new Mesh(new BoxGeometry(espessura, altura, 0.32), material);
    const zBase = PROFUNDIDADE / 2 - 0.18;
    mesh.position.set(x + espessura / 2, base + altura / 2, zBase);
    mesh.castShadow = true;
    mesh.name = `livro__${projeto.id}`;
    marcarInterativo(mesh, { tipo: 'projeto', id: projeto.id, rotulo: projeto.nome });

    // Faixas douradas na lombada: diferenciam os livros "de verdade".
    const faixa = materialFosco(PALETA.amarelo);
    [0.12, -0.12].forEach((dy) => {
      const f = caixa(espessura + 0.004, 0.025, 0.004, faixa, 0, dy * altura, 0.162);
      f.castShadow = false;
      mesh.add(f);
    });

    this.livrosGrupo.add(mesh);
    this.livros.push({ id: projeto.id, mesh, material, zBase, saida: 0, brilho: 0 });
    return x + espessura;
  }

  /** Livros decorativos (não clicáveis) do ponto `de` até `ate`. Devolve onde parou. */
  private enfeites(de: number, ate: number, base: number, limite: number): number {
    let x = de;
    while (x < ate - 0.06) {
      if (Math.random() < 0.08) {
        x += 0.12; // vão entre livros
        continue;
      }
      const espessura = Math.min(0.05 + Math.random() * 0.07, ate - x);
      const altura = Math.min(limite - 0.04, 0.24 + Math.random() * 0.14);
      this.auxiliar.position.set(x + espessura / 2, base + altura / 2, PROFUNDIDADE / 2 - 0.2);
      this.auxiliar.scale.set(espessura, altura, 0.26 + Math.random() * 0.04);
      this.auxiliar.updateMatrix();
      this.enfeitesPendentes.push({
        matriz: this.auxiliar.matrix.clone(),
        cor: CORES_ENFEITE[Math.floor(Math.random() * CORES_ENFEITE.length)],
      });
      x += espessura + 0.004;
    }
    return x;
  }
}
