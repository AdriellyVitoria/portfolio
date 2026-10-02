import {
  CircleGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PointLight,
  SphereGeometry,
  Vector3,
} from 'three';

import { CATEGORIAS_SKILL, type Skill } from '../../core/models';
import { PALETA } from '../paleta';
import type { ParteCena } from '../tipos';
import {
  atlasDeTexto,
  caixa,
  descartar,
  fundirEstaticos,
  marcarDinamico,
  marcarInterativo,
  materialFosco,
} from '../util';

const CENTRO_Z = -2.6;
const PROFUNDIDADE_DEGRAU = 0.34;
const ALTURA_DEGRAU = 0.3;
const ESPACO_ROTULO = 1.0; // à esquerda de cada degrau, para a placa da categoria
const ESPACO_VASO = 0.5;
const CORES_FLOR = [PALETA.rosa, PALETA.lilas, PALETA.amarelo, PALETA.laranja];

/**
 * Étagère de vasos: cada skill é um vaso com etiqueta; as principais estão floridas.
 * Um degrau por categoria do currículo.
 *
 * Para caber dezenas de vasos sem dezenas de chamadas de desenho, tudo que é estático
 * é fundido por material e as etiquetas saem de um único atlas de texto. A skill
 * escolhida ganha um halo, uma luz e um marcador flutuante (os vasos não se movem).
 */
export class FloriculturaArea implements ParteCena {
  readonly grupo = new Group();
  private readonly estatico = new Group();
  private readonly cliques = marcarDinamico(new Group());
  private alvosMeshes: Mesh[] = [];
  private readonly posicoes = new Map<string, Vector3>();
  private selecionado: string | null = null;

  // Destaque da skill escolhida.
  private readonly destaque = marcarDinamico(new Group());
  private readonly halo = new MeshStandardMaterial({
    color: PALETA.amarelo,
    emissive: PALETA.amarelo,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.85,
  });
  private readonly marcador: Mesh;
  private readonly luz = new PointLight(PALETA.luzQuente, 0, 2.2, 1.2);
  private intensidade = 0;

  constructor() {
    this.grupo.name = 'floricultura';
    this.grupo.position.set(0, 0, CENTRO_Z);

    const disco = new Mesh(new CircleGeometry(0.26, 20), this.halo);
    disco.rotation.x = -Math.PI / 2;
    disco.position.y = 0.005;
    this.marcador = new Mesh(
      new OctahedronGeometry(0.09, 0),
      new MeshBasicMaterial({ color: PALETA.amarelo }),
    );
    this.luz.position.y = 0.55;
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
    this.posicoes.clear();

    const categorias = CATEGORIAS_SKILL.map((c) => ({
      ...c,
      skills: skills.filter((s) => s.categoria === c.id),
    })).filter((c) => c.skills.length);
    const maxPorDegrau = Math.max(1, ...categorias.map((c) => c.skills.length));
    const largura = ESPACO_ROTULO + maxPorDegrau * ESPACO_VASO + 0.2;

    // Todos os textos (categorias e skills) num único atlas.
    const textos = [...categorias.map((c) => c.rotuloCurto), ...skills.map((s) => s.nome)];
    const atlas = atlasDeTexto(textos);
    const materialTexto = atlas
      ? new MeshStandardMaterial({ map: atlas.textura, roughness: 0.8 })
      : undefined;
    const indiceTexto = new Map(textos.map((t, i) => [t, i]));

    // Materiais compartilhados: menos materiais = mais coisas fundidas juntas.
    const materiais = {
      madeira: materialFosco(PALETA.madeiraClara),
      madeiraEscura: materialFosco(PALETA.madeira),
      vasoDestaque: materialFosco(PALETA.terracota),
      vaso: materialFosco(0xc4785a),
      folhagemDestaque: materialFosco(PALETA.verde),
      folhagem: materialFosco(PALETA.verdeEscuro),
      haste: materialFosco(PALETA.madeira),
      flores: CORES_FLOR.map((c) => materialFosco(c)),
      invisivel: new MeshStandardMaterial({ visible: false }),
    };

    categorias.forEach((categoria, nivel) => {
      const y = ALTURA_DEGRAU * (nivel + 1);
      const z = -nivel * PROFUNDIDADE_DEGRAU;
      // Cada degrau vai do chão até a altura dele (assim a frente fica fechada).
      this.estatico.add(
        caixa(
          largura,
          y,
          PROFUNDIDADE_DEGRAU,
          nivel % 2 ? materiais.madeiraEscura : materiais.madeira,
          0,
          y / 2,
          z,
        ),
      );
      if (atlas && materialTexto) {
        const placa = new Mesh(
          atlas.plano(indiceTexto.get(categoria.rotuloCurto)!, 0.85, 0.22),
          materialTexto,
        );
        placa.position.set(
          -largura / 2 + ESPACO_ROTULO / 2,
          y - ALTURA_DEGRAU / 2,
          z + PROFUNDIDADE_DEGRAU / 2 + 0.005,
        );
        this.estatico.add(placa);
      }

      const inicio = -largura / 2 + ESPACO_ROTULO + ESPACO_VASO / 2;
      categoria.skills.forEach((skill, i) => {
        const x = inicio + i * ESPACO_VASO;
        this.montarVaso(
          skill,
          x,
          y,
          z,
          materiais,
          atlas ? { atlas, material: materialTexto!, indice: indiceTexto.get(skill.nome)! } : null,
        );
      });
    });

    fundirEstaticos(this.estatico);
  }

  selecionar(id: string | null): void {
    this.selecionado = id;
  }

  update(dt: number, tempo: number): void {
    const posicao = this.selecionado ? this.posicoes.get(this.selecionado) : undefined;
    const suavidade = 1 - Math.exp(-dt * 8);
    this.intensidade = MathUtils.lerp(this.intensidade, posicao ? 1 : 0, suavidade);

    if (posicao) {
      this.destaque.position.copy(posicao);
    }
    this.destaque.visible = this.intensidade > 0.02;
    this.luz.intensity = this.intensidade * 5;
    this.halo.opacity = 0.85 * this.intensidade;
    this.halo.emissiveIntensity = 0.6 + Math.sin(tempo * 3) * 0.25;
    this.marcador.position.y = 0.95 + Math.sin(tempo * 2.5) * 0.04;
    this.marcador.rotation.y = tempo * 1.5;
  }

  private montarVaso(
    skill: Skill,
    x: number,
    y: number,
    z: number,
    m: {
      vasoDestaque: MeshStandardMaterial;
      vaso: MeshStandardMaterial;
      folhagemDestaque: MeshStandardMaterial;
      folhagem: MeshStandardMaterial;
      haste: MeshStandardMaterial;
      flores: MeshStandardMaterial[];
      invisivel: MeshStandardMaterial;
    },
    texto: {
      atlas: NonNullable<ReturnType<typeof atlasDeTexto>>;
      material: MeshStandardMaterial;
      indice: number;
    } | null,
  ): void {
    const vaso = new Mesh(
      new CylinderGeometry(0.13, 0.095, 0.22, 10),
      skill.destaque ? m.vasoDestaque : m.vaso,
    );
    vaso.position.set(x, y + 0.11, z);
    const folhagem = new Mesh(
      new IcosahedronGeometry(0.14, 0),
      skill.destaque ? m.folhagemDestaque : m.folhagem,
    );
    folhagem.position.set(x, y + 0.31, z);
    folhagem.scale.set(1, 1.25, 1);
    [vaso, folhagem].forEach((p) => (p.castShadow = true));
    this.estatico.add(vaso, folhagem);

    // Skills principais "florescem".
    if (skill.destaque) {
      const flor = m.flores[skill.ordem % m.flores.length];
      for (let i = 0; i < 5; i++) {
        const angulo = (i / 5) * Math.PI * 2;
        const petala = new Mesh(new SphereGeometry(0.042, 6, 5), flor);
        petala.position.set(
          x + Math.cos(angulo) * 0.1,
          y + 0.39 + (i % 2) * 0.05,
          z + Math.sin(angulo) * 0.1,
        );
        this.estatico.add(petala);
      }
    }

    // Etiqueta espetada no vaso, acima da planta: os vasos da frente não a escondem.
    if (texto) {
      const haste = new Mesh(new CylinderGeometry(0.006, 0.006, 0.4, 4), m.haste);
      haste.position.set(x + 0.08, y + 0.4, z + 0.07);
      const etiqueta = new Mesh(texto.atlas.plano(texto.indice, 0.4, 0.11), texto.material);
      etiqueta.position.set(x + 0.08, y + 0.63, z + 0.08);
      etiqueta.rotation.x = -0.35; // inclinada para a câmera, que olha de cima
      this.estatico.add(haste, etiqueta);
    }

    // Área de clique invisível (não é desenhada; só o raycasting a enxerga).
    const area = new Mesh(new CylinderGeometry(0.22, 0.22, 0.75, 8), m.invisivel);
    area.position.set(x, y + 0.37, z);
    area.name = `vaso__${skill.id}`;
    this.alvosMeshes.push(
      ...marcarInterativo(area, { tipo: 'skill', id: skill.id, rotulo: skill.nome }),
    );
    this.cliques.add(area);
    this.posicoes.set(skill.id, new Vector3(x, y, z));
  }
}
