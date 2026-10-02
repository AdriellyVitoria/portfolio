import {
  Color,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
} from 'three';

import type { CategoriaSkill, Skill } from '../../core/models';
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

const CENTRO_Z = -3.0;
const LARGURA_DEGRAU = 3.8;
const PROFUNDIDADE_DEGRAU = 0.42;
const ALTURA_DEGRAU = 0.36;
const ESPACO_ROTULO = 0.9; // à esquerda de cada degrau, para a placa da categoria
const ESPACO_VASO = 0.52;

const CATEGORIAS: { id: CategoriaSkill; rotulo: string }[] = [
  { id: 'FRONTEND', rotulo: 'Frontend' },
  { id: 'BACKEND', rotulo: 'Backend' },
  { id: 'BANCO', rotulo: 'Banco' },
  { id: 'OUTROS', rotulo: 'Outros' },
];
const CORES_FLOR = [PALETA.rosa, PALETA.lilas, PALETA.amarelo, PALETA.laranja];

interface Vaso {
  id: string;
  grupo: Group;
  material: MeshStandardMaterial;
  elevacao: number;
  brilho: number;
}

/** Étagère de vasos: cada skill é um vaso com plaquinha; as principais estão floridas. */
export class FloriculturaArea implements ParteCena {
  readonly grupo = new Group();
  private readonly vasosGrupo = new Group();
  private vasos: Vaso[] = [];
  private alvosMeshes: Mesh[] = [];
  private selecionado: string | null = null;

  constructor() {
    this.grupo.name = 'floricultura';
    this.grupo.position.set(0, 0, CENTRO_Z);
    this.grupo.add(this.vasosGrupo);
  }

  get alvos(): Mesh[] {
    return this.alvosMeshes;
  }

  montar(skills: Skill[]): void {
    descartar(this.vasosGrupo);
    this.vasosGrupo.clear();
    this.vasos = [];
    this.alvosMeshes = [];

    CATEGORIAS.forEach((categoria, nivel) => {
      const y = ALTURA_DEGRAU * (nivel + 1);
      const z = -nivel * PROFUNDIDADE_DEGRAU;
      this.montarDegrau(categoria.rotulo, nivel, y, z);

      const doNivel = skills.filter((s) => s.categoria === categoria.id);
      const inicio = -LARGURA_DEGRAU / 2 + ESPACO_ROTULO + ESPACO_VASO / 2;
      doNivel.forEach((skill, i) => this.montarVaso(skill, inicio + i * ESPACO_VASO, y, z));
    });

    this.adicionarPlaca('Floricultura · Skills', 0, ALTURA_DEGRAU * 4 + 0.95, -1.4, 2.2, 0.36);
    fundirEstaticos(this.vasosGrupo);
  }

  selecionar(id: string | null): void {
    this.selecionado = id;
  }

  update(dt: number, tempo: number): void {
    const suavidade = 1 - Math.exp(-dt * 8);
    for (const vaso of this.vasos) {
      const ativo = this.selecionado === vaso.id;
      vaso.elevacao = MathUtils.lerp(vaso.elevacao, ativo ? 0.08 : 0, suavidade);
      vaso.brilho = MathUtils.lerp(vaso.brilho, ativo ? 0.45 : 0, suavidade);
      vaso.grupo.position.y = vaso.grupo.userData['yBase'] + vaso.elevacao;
      vaso.grupo.rotation.y = ativo ? Math.sin(tempo * 2) * 0.12 : 0;
      vaso.material.emissiveIntensity = vaso.brilho;
    }
  }

  private montarDegrau(rotulo: string, nivel: number, y: number, z: number): void {
    const madeira = materialFosco(nivel % 2 ? PALETA.madeira : PALETA.madeiraClara);
    // Cada degrau é uma caixa do chão até a altura dele (assim a frente fica fechada).
    this.vasosGrupo.add(caixa(LARGURA_DEGRAU, y, PROFUNDIDADE_DEGRAU, madeira, 0, y / 2, z));
    this.adicionarPlaca(
      rotulo,
      -LARGURA_DEGRAU / 2 + ESPACO_ROTULO / 2,
      y - ALTURA_DEGRAU / 2,
      z + PROFUNDIDADE_DEGRAU / 2 + 0.005,
      0.75,
      0.2,
    );
  }

  private montarVaso(skill: Skill, x: number, y: number, z: number): void {
    const grupo = marcarDinamico(new Group());
    grupo.position.set(x, y, z);
    grupo.userData['yBase'] = y;

    const material = new MeshStandardMaterial({
      color: skill.destaque ? PALETA.terracota : 0xc4785a,
      emissive: new Color(PALETA.amarelo),
      emissiveIntensity: 0,
      roughness: 0.8,
      flatShading: true,
    });
    const vaso = new Mesh(new CylinderGeometry(0.14, 0.1, 0.24, 10), material);
    vaso.position.y = 0.12;
    const folhagem = new Mesh(
      new IcosahedronGeometry(0.15, 0),
      materialFosco(skill.destaque ? PALETA.verde : PALETA.verdeEscuro),
    );
    folhagem.position.y = 0.34;
    folhagem.scale.set(1, 1.25, 1);
    [vaso, folhagem].forEach((m) => (m.castShadow = true));
    grupo.add(vaso, folhagem);

    // Skills principais "florescem".
    if (skill.destaque) {
      const flor = materialFosco(CORES_FLOR[skill.ordem % CORES_FLOR.length]);
      for (let i = 0; i < 5; i++) {
        const angulo = (i / 5) * Math.PI * 2;
        const petala = new Mesh(new SphereGeometry(0.045, 6, 5), flor);
        petala.position.set(
          Math.cos(angulo) * 0.11,
          0.42 + (i % 2) * 0.05,
          Math.sin(angulo) * 0.11,
        );
        grupo.add(petala);
      }
    }

    // Etiqueta espetada no vaso, acima da planta: os vasos da frente não a escondem.
    const textura = texturaDeTexto(skill.nome, {
      largura: 384,
      altura: 104,
      fundo: '#fbf6ee',
      cor: '#3b261b',
      fonte: '600 56px "Inter Variable", system-ui, sans-serif',
    });
    if (textura) {
      const haste = new Mesh(
        new CylinderGeometry(0.006, 0.006, 0.42, 4),
        materialFosco(PALETA.madeira),
      );
      haste.position.set(0.09, 0.42, 0.08);
      const etiqueta = new Mesh(
        new PlaneGeometry(0.42, 0.115),
        new MeshStandardMaterial({ map: textura, roughness: 0.8 }),
      );
      etiqueta.position.set(0.09, 0.66, 0.09);
      etiqueta.rotation.x = -0.35; // inclinada para a câmera, que olha de cima
      grupo.add(haste, etiqueta);
    }

    // Área de clique maior que o vaso, invisível: facilita acertar no celular.
    const areaClique = new Mesh(
      new CylinderGeometry(0.22, 0.22, 0.6, 8),
      new MeshStandardMaterial({ visible: false }),
    );
    areaClique.position.y = 0.3;
    grupo.add(areaClique);

    fundirEstaticos(grupo); // pétalas da mesma cor viram um mesh só
    this.alvosMeshes.push(
      ...marcarInterativo(grupo, { tipo: 'skill', id: skill.id, rotulo: skill.nome }),
    );
    grupo.name = `vaso__${skill.id}`;
    this.vasosGrupo.add(grupo);
    this.vasos.push({ id: skill.id, grupo, material, elevacao: 0, brilho: 0 });
  }

  private adicionarPlaca(
    texto: string,
    x: number,
    y: number,
    z: number,
    largura: number,
    altura: number,
  ): void {
    const px = 512;
    const textura = texturaDeTexto(texto, {
      largura: px,
      altura: Math.round((px * altura) / largura),
      fundo: '#fbf6ee',
      cor: '#3b261b',
      fonte: `600 ${Math.round(((px * altura) / largura) * 0.55)}px "Inter Variable", system-ui, sans-serif`,
    });
    if (!textura) return;
    const placa = new Mesh(
      new PlaneGeometry(largura, altura),
      new MeshStandardMaterial({ map: textura }),
    );
    placa.position.set(x, y, z);
    this.vasosGrupo.add(placa);
  }
}
