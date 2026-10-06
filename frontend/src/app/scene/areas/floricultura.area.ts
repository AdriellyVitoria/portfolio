import {
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  PointLight,
  Quaternion,
  SRGBColorSpace,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';

import { CATEGORIAS_SKILL, type CategoriaSkill, type Skill } from '../../core/models';
import { PALETA } from '../paleta';
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

// Os vasos ficam num arco aberto, voltado para quem chega (centro, raio e ângulos do arco).
const CENTRO_ARCO = new Vector3(0, 0, -1.9);
const RAIO_ARCO = 2.5;
const ANGULO_INICIAL = MathUtils.degToRad(196);
const ANGULO_FINAL = MathUtils.degToRad(344);
/** Para onde vasos e placas olham (a câmera da estação fica por aí). */
const OLHAR_PARA = new Vector3(0, 0, 3);

const LARGURA_PLACA = 0.8;
const BASE_PLACA = 1.05; // altura da placa acima da base do vaso
const DEGRAU_PLACA = 0.38; // placas alternam alto/baixo para não se cobrirem

/** Cor das flores de cada categoria (detalhes em rosa/lilás, como pede a paleta). */
const COR_FLOR: Record<CategoriaSkill, number> = {
  FRONTEND: PALETA.rosa,
  BACKEND: PALETA.laranja,
  BANCO: PALETA.amarelo,
  MENSAGERIA: PALETA.lilas,
  DEVOPS: 0xe07a5f,
  IA: 0xf6ecdb,
  PRATICAS: 0xe8a6c0,
};

interface Materiais {
  vaso: MeshStandardMaterial;
  faixa: MeshStandardMaterial;
  terra: MeshStandardMaterial;
  folhas: MeshStandardMaterial[];
  miolo: MeshStandardMaterial;
  madeira: MeshStandardMaterial;
  madeiraClara: MeshStandardMaterial;
  invisivel: MeshStandardMaterial;
}

interface Canteiro {
  categoria: CategoriaSkill;
  base: Vector3;
  topoPlaca: number;
}

/**
 * Floricultura: um vaso florido por categoria de skills, com uma placa de madeira
 * listando as tecnologias. Tocar num vaso escolhe a categoria (o HUD mostra as skills).
 * Tudo que é estático é fundido por material; a categoria escolhida ganha halo,
 * luz e um marcador sobre a placa.
 */
export class FloriculturaArea implements ParteCena {
  readonly grupo = new Group();
  private readonly estatico = new Group();
  private readonly cliques = marcarDinamico(new Group());
  private alvosMeshes: Mesh[] = [];
  private canteiros: Canteiro[] = [];
  private selecionada: CategoriaSkill | null = null;

  private readonly destaque = marcarDinamico(new Group());
  private readonly halo = new MeshStandardMaterial({
    color: PALETA.amarelo,
    emissive: PALETA.amarelo,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.85,
  });
  private readonly marcador: Mesh;
  private readonly luz = new PointLight(PALETA.luzQuente, 0, 2.6, 1.2);
  private intensidade = 0;

  constructor() {
    this.grupo.name = 'floricultura';

    const disco = new Mesh(new CircleGeometry(0.42, 24), this.halo);
    disco.rotation.x = -Math.PI / 2;
    disco.position.y = 0.006;
    this.marcador = new Mesh(
      new OctahedronGeometry(0.09, 0),
      new MeshBasicMaterial({ color: PALETA.amarelo }),
    );
    // Baixa e à frente: ilumina vaso e planta, não a placa (que ficaria lavada).
    this.luz.position.set(0, 0.55, 0.5);
    this.destaque.add(disco, this.marcador, this.luz);
    this.destaque.visible = false;

    this.grupo.add(this.estatico, this.cliques, this.destaque);
  }

  get alvos(): Mesh[] {
    return this.alvosMeshes;
  }

  montar(skills: Skill[]): void {
    descartar(this.estatico);
    this.estatico.clear();
    descartar(this.cliques);
    this.cliques.clear();
    this.alvosMeshes = [];
    this.canteiros = [];

    const categorias = CATEGORIAS_SKILL.map((c) => ({
      ...c,
      skills: skills.filter((s) => s.categoria === c.id),
    })).filter((c) => c.skills.length);

    // Materiais compartilhados entre os vasos: assim eles se fundem em poucos meshes.
    const materiais: Materiais = {
      vaso: materialFosco(PALETA.terracota),
      faixa: materialFosco(PALETA.creme),
      terra: materialFosco(PALETA.marromEscuro),
      folhas: [
        materialFosco(PALETA.verde),
        materialFosco(PALETA.verdeEscuro),
        materialFosco(0x7d9a5a),
      ],
      miolo: materialFosco(PALETA.amarelo),
      madeira: materialFosco(PALETA.madeira),
      madeiraClara: materialFosco(PALETA.madeiraClara),
      invisivel: new MeshStandardMaterial({ visible: false }),
    };

    categorias.forEach((categoria, i) => {
      const t = categorias.length === 1 ? 0.5 : i / (categorias.length - 1);
      const angulo = MathUtils.lerp(ANGULO_INICIAL, ANGULO_FINAL, t);
      // Caixotes um pouco mais altos no meio do arco: dá ritmo, como numa vitrine.
      const elevacao = Math.round(Math.sin(Math.PI * t) * 0.32 * 20) / 20;
      const base = new Vector3(
        CENTRO_ARCO.x + Math.cos(angulo) * RAIO_ARCO,
        elevacao,
        CENTRO_ARCO.z + Math.sin(angulo) * RAIO_ARCO,
      );
      const alturaPlaca = BASE_PLACA + (i % 2) * DEGRAU_PLACA;
      this.montarCanteiro(
        categoria.id,
        categoria.rotulo,
        categoria.skills,
        base,
        alturaPlaca,
        materiais,
      );
    });

    this.montarPlacaDaParede();
    fundirEstaticos(this.estatico);
  }

  /** Placa "Floricultura · Skills" na parede, no mesmo estilo da "Livraria · Projetos". */
  private montarPlacaDaParede(): void {
    const largura = 2.1;
    const altura = 0.36;
    const textura = texturaDeTexto('Floricultura · Skills', {
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
    placa.position.set(CENTRO_ARCO.x, 2.85, -4.96);
    this.estatico.add(placa);
  }

  /** Destaca o vaso da categoria (ou nenhum, com `null`). */
  selecionar(categoria: CategoriaSkill | null): void {
    this.selecionada = categoria;
  }

  update(dt: number, tempo: number): void {
    const canteiro = this.canteiros.find((c) => c.categoria === this.selecionada);
    const suavidade = 1 - Math.exp(-dt * 8);
    this.intensidade = MathUtils.lerp(this.intensidade, canteiro ? 1 : 0, suavidade);

    if (canteiro) {
      this.destaque.position.copy(canteiro.base);
      this.marcador.position.y = canteiro.topoPlaca + 0.16 + Math.sin(tempo * 2.5) * 0.04;
    }
    this.destaque.visible = this.intensidade > 0.02;
    this.luz.intensity = this.intensidade * 2.5;
    this.halo.opacity = 0.75 * this.intensidade;
    this.halo.emissiveIntensity = 0.6 + Math.sin(tempo * 3) * 0.2;
    this.marcador.rotation.y = tempo * 1.5;
  }

  private montarCanteiro(
    categoria: CategoriaSkill,
    rotulo: string,
    skills: Skill[],
    base: Vector3,
    basePlaca: number,
    m: Materiais,
  ): void {
    const canteiro = new Group();
    canteiro.position.copy(base);
    canteiro.lookAt(OLHAR_PARA.x, base.y, OLHAR_PARA.z);

    // Caixote de madeira, quando o vaso fica mais alto.
    if (base.y > 0.04) {
      canteiro.add(caixa(0.56, base.y, 0.56, m.madeiraClara, 0, -base.y / 2, 0));
      [0.25, 0.5, 0.75].forEach((f) =>
        canteiro.add(caixa(0.58, 0.015, 0.01, m.madeira, 0, -base.y * f, 0.285)),
      );
    }

    this.montarVaso(canteiro, m);
    this.montarPlanta(canteiro, categoria, m);
    const alturaPlaca = this.montarPlaca(canteiro, rotulo, skills, basePlaca, m);
    this.estatico.add(canteiro);

    // Área de clique: vaso, planta e placa (invisível; só o raycasting a enxerga).
    const topo = basePlaca + alturaPlaca;
    const area = new Mesh(new CylinderGeometry(0.42, 0.42, topo + 0.1, 10), m.invisivel);
    area.position.set(base.x, base.y + (topo + 0.1) / 2, base.z);
    area.name = `vaso__${categoria}`;
    this.alvosMeshes.push(
      ...marcarInterativo(area, {
        tipo: 'categoria',
        id: categoria,
        rotulo: `${rotulo} · ver skills`,
      }),
    );
    this.cliques.add(area);
    this.canteiros.push({ categoria, base, topoPlaca: topo });
  }

  /** Vaso torneado (perfil girado em volta do eixo), com borda e faixa creme. */
  private montarVaso(canteiro: Group, m: Materiais): void {
    const perfil = [
      new Vector2(0, 0),
      new Vector2(0.15, 0),
      new Vector2(0.17, 0.03),
      new Vector2(0.2, 0.18),
      new Vector2(0.23, 0.33),
      new Vector2(0.26, 0.35),
      new Vector2(0.26, 0.41),
      new Vector2(0.23, 0.41),
    ];
    const vaso = new Mesh(new LatheGeometry(perfil, 16), m.vaso);
    vaso.castShadow = true;
    const faixa = new Mesh(new TorusGeometry(0.205, 0.012, 4, 20), m.faixa);
    faixa.rotation.x = Math.PI / 2;
    faixa.position.y = 0.2;
    const terra = new Mesh(new CylinderGeometry(0.235, 0.235, 0.02, 16), m.terra);
    terra.position.y = 0.39;
    canteiro.add(vaso, faixa, terra);
  }

  /**
   * Planta cheia e natural: folhas de baixo abertas para os lados, folhas de cima um pouco
   * erguidas e um buquê redondo de flores de cinco pétalas por cima, cada uma virada
   * para fora. Uma variação pseudoaleatória por categoria evita vasos idênticos.
   */
  private montarPlanta(canteiro: Group, categoria: CategoriaSkill, m: Materiais): void {
    const aleatorio = sementeAleatoria(categoria);
    const geometriaFolha = new SphereGeometry(1, 6, 4);

    const camadas = [
      { quantidade: 13, altura: 0.43, raio: 0.12, inclinacao: 0.28, tamanho: [0.075, 0.018, 0.28] },
      { quantidade: 10, altura: 0.48, raio: 0.07, inclinacao: 0.75, tamanho: [0.055, 0.016, 0.22] },
    ];
    camadas.forEach((camada, c) => {
      for (let k = 0; k < camada.quantidade; k++) {
        const giro = (k / camada.quantidade) * Math.PI * 2 + c * 0.3 + aleatorio() * 0.3;
        const escala = 0.85 + aleatorio() * 0.35;
        const folha = new Mesh(geometriaFolha, m.folhas[(k + c) % m.folhas.length]);
        const [lx, ly, lz] = camada.tamanho;
        folha.scale.set(lx * escala, ly, lz * escala);
        folha.position.set(
          Math.sin(giro) * camada.raio,
          camada.altura + aleatorio() * 0.03,
          Math.cos(giro) * camada.raio,
        );
        folha.rotation.set(-(camada.inclinacao + (aleatorio() - 0.5) * 0.25), giro, 0, 'YXZ');
        folha.castShadow = true;
        canteiro.add(folha);
      }
    });

    // Buquê: flores distribuídas numa meia-esfera sobre as folhas, viradas para fora.
    const petala = materialFosco(COR_FLOR[categoria]);
    const geometriaPetala = new SphereGeometry(1, 6, 4);
    const geometriaMiolo = new IcosahedronGeometry(0.02, 0);
    const centroBuque = new Vector3(0, 0.6, 0.02);
    const frente = new Vector3(0, 0, 1);
    const quantidade = 17;
    for (let k = 0; k < quantidade; k++) {
      // Espiral de Fibonacci na meia-esfera: espalha as flores de forma uniforme.
      const fracao = (k + 0.5) / quantidade;
      const polar = Math.acos(1 - fracao * 0.85); // do topo até um pouco abaixo do "equador"
      const giro = k * 2.39996 + aleatorio() * 0.3;
      const direcao = new Vector3(
        Math.sin(polar) * Math.sin(giro),
        Math.cos(polar),
        Math.sin(polar) * Math.cos(giro),
      );
      const raio = 0.16 + aleatorio() * 0.03;

      const flor = new Group();
      flor.position.copy(centroBuque).addScaledVector(direcao, raio);
      flor.quaternion.copy(new Quaternion().setFromUnitVectors(frente, direcao));
      flor.rotateZ(aleatorio() * Math.PI);
      const tamanho = 1.05 + aleatorio() * 0.45;
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        const peca = new Mesh(geometriaPetala, petala);
        peca.scale.set(0.024 * tamanho, 0.037 * tamanho, 0.008);
        peca.position.set(Math.cos(a) * 0.029 * tamanho, Math.sin(a) * 0.029 * tamanho, 0);
        peca.rotation.set(0.25, 0, a - Math.PI / 2); // pétalas levemente em concha
        flor.add(peca);
      }
      const miolo = new Mesh(geometriaMiolo, m.miolo);
      miolo.position.z = 0.012;
      flor.add(miolo);
      canteiro.add(flor);
    }
  }

  /** Placa de madeira sobre duas hastes, com a categoria e as skills. Devolve a altura. */
  private montarPlaca(
    canteiro: Group,
    rotulo: string,
    skills: Skill[],
    basePlaca: number,
    m: Materiais,
  ): number {
    const textura = texturaDaPlaca(
      rotulo,
      skills.map((s) => s.nome),
    );
    const altura = textura ? LARGURA_PLACA * textura.proporcao : 0.4;
    const z = -0.16; // atrás da planta
    [-0.31, 0.31].forEach((x) => {
      const haste = new Mesh(new CylinderGeometry(0.012, 0.012, basePlaca - 0.32), m.madeira);
      haste.position.set(x, 0.32 + (basePlaca - 0.32) / 2, z);
      canteiro.add(haste);
    });
    canteiro.add(
      caixa(LARGURA_PLACA + 0.05, altura + 0.05, 0.03, m.madeira, 0, basePlaca + altura / 2, z),
    );
    if (textura) {
      const placa = new Mesh(
        new PlaneGeometry(LARGURA_PLACA, altura),
        // Material sem iluminação: a placa mantém o contraste como uma etiqueta impressa,
        // mesmo com a luz do destaque ou na sombra.
        new MeshBasicMaterial({ map: textura.textura, color: 0xfff1d8 }),
      );
      placa.position.set(0, basePlaca + altura / 2, z + 0.017);
      canteiro.add(placa);
    }
    return altura;
  }
}

/** Gerador pseudoaleatório com semente (a mesma categoria sempre gera a mesma planta). */
function sementeAleatoria(texto: string): () => number {
  let estado = [...texto].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

/**
 * Placa da categoria: título e skills separadas por "·", quebrando linhas.
 * Devolve `null` onde não há canvas 2D (ex.: testes em jsdom).
 */
function texturaDaPlaca(
  titulo: string,
  itens: string[],
): { textura: CanvasTexture; proporcao: number } | null {
  if (typeof document === 'undefined') return null;
  const largura = 512;
  const margem = 26;
  const fonteItens = '600 34px "Inter Variable", system-ui, sans-serif';
  const medir = document.createElement('canvas').getContext('2d');
  if (!medir) return null;

  medir.font = fonteItens;
  const linhas: string[] = [];
  let atual = '';
  for (const item of itens) {
    const tentativa = atual ? `${atual} · ${item}` : item;
    if (medir.measureText(tentativa).width > largura - margem * 2 && atual) {
      linhas.push(atual);
      atual = item;
    } else {
      atual = tentativa;
    }
  }
  if (atual) linhas.push(atual);

  const alturaTitulo = 54;
  const alturaLinha = 42;
  const altura = margem + alturaTitulo + 10 + linhas.length * alturaLinha + margem - 6;
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fbf6ee';
  ctx.fillRect(0, 0, largura, altura);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Título: diminui a fonte até caber (ex.: "Arquitetura, testes e métodos").
  const textoTitulo = titulo.toUpperCase();
  let tamanho = 48;
  ctx.font = `700 ${tamanho}px "Fraunces Variable", Georgia, serif`;
  while (tamanho > 26 && ctx.measureText(textoTitulo).width > largura - margem * 2) {
    tamanho -= 2;
    ctx.font = `700 ${tamanho}px "Fraunces Variable", Georgia, serif`;
  }
  ctx.fillStyle = '#8a3a22';
  ctx.fillText(textoTitulo, largura / 2, margem + (alturaTitulo - tamanho) / 2);

  ctx.fillStyle = '#24160f';
  ctx.font = fonteItens;
  linhas.forEach((linha, i) =>
    ctx.fillText(linha, largura / 2, margem + alturaTitulo + 10 + i * alturaLinha),
  );

  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace;
  textura.anisotropy = 4;
  return { textura, proporcao: altura / largura };
}
