import {
  Color,
  CylinderGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  TorusGeometry,
} from 'three';

import type { PainelCafe } from '../../core/models';
import { PALETA } from '../paleta';
import type { ParteCena } from '../tipos';
import {
  caixa,
  fundirEstaticos,
  marcarDinamico,
  marcarInterativo,
  materialFosco,
  texturaDeTexto,
} from '../util';

const MESA = { x: 4.7, z: -1.6, altura: 0.76 };

interface ItemMesa {
  id: PainelCafe;
  grupo: Group;
  materiais: MeshStandardMaterial[];
  brilho: number;
}

/** Balcão, lousa e a mesa com notebook (apresentação), cardápio (trajetória) e pasta (contato). */
export class CafeArea implements ParteCena {
  readonly grupo = new Group();
  readonly alvos: Mesh[] = [];
  private readonly itens: ItemMesa[] = [];
  private aberto: PainelCafe | null = null;
  private sobCursor: PainelCafe | null = null;

  constructor() {
    this.grupo.name = 'cafe';
    this.montarBalcao();
    this.montarMesa();
    this.montarItens();
    fundirEstaticos(this.grupo);
  }

  /** Destaca o item cujo painel está aberto. */
  marcarAberto(painel: PainelCafe | null): void {
    this.aberto = painel;
  }

  marcarSobCursor(painel: PainelCafe | null): void {
    this.sobCursor = painel;
  }

  update(dt: number, tempo: number): void {
    const suavidade = 1 - Math.exp(-dt * 8);
    for (const item of this.itens) {
      const ativo = this.aberto === item.id || this.sobCursor === item.id;
      // Sem nada aberto, um brilho bem leve pulsa para convidar ao clique.
      const convite = this.aberto
        ? 0
        : 0.08 + Math.sin(tempo * 2 + item.grupo.position.x * 5) * 0.06;
      item.brilho = MathUtils.lerp(item.brilho, ativo ? 0.45 : convite, suavidade);
      item.materiais.forEach((m) => (m.emissiveIntensity = item.brilho));
    }
  }

  private montarBalcao(): void {
    const madeira = materialFosco(PALETA.madeira);
    const tampo = materialFosco(PALETA.marromEscuro);
    const balcao = new Group();
    balcao.position.set(5.2, 0, -3.9);
    balcao.add(
      caixa(3.2, 1.0, 0.6, madeira, 0, 0.5, 0),
      caixa(3.3, 0.06, 0.7, tampo, 0, 1.03, 0),
      // Painéis decorativos na frente do balcão.
      ...[-1.05, 0, 1.05].map((x) =>
        caixa(0.9, 0.6, 0.02, materialFosco(PALETA.madeiraClara), x, 0.5, 0.31),
      ),
    );

    // Máquina de café.
    const metal = materialFosco(0x6f6a64, { roughness: 0.4, metalness: 0.5 });
    const maquina = new Group();
    maquina.position.set(-0.8, 1.06, -0.05);
    maquina.add(
      caixa(0.6, 0.5, 0.4, materialFosco(PALETA.terracota), 0, 0.25, 0),
      caixa(0.5, 0.06, 0.3, metal, 0, 0.53, 0),
      caixa(0.08, 0.14, 0.08, metal, -0.12, 0.12, 0.22),
      caixa(0.08, 0.14, 0.08, metal, 0.12, 0.12, 0.22),
    );
    balcao.add(maquina);

    // Xícaras e um pote de vidro com biscoitos.
    const louca = materialFosco(PALETA.cremeClaro);
    [0.2, 0.45, 0.7].forEach((x) => balcao.add(this.xicara(louca, x, 1.06, 0.1)));
    const pote = new Mesh(
      new CylinderGeometry(0.13, 0.13, 0.28, 12),
      new MeshStandardMaterial({
        color: 0xf3e7d3,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
      }),
    );
    pote.position.set(1.15, 1.2, 0);
    balcao.add(pote);
    this.grupo.add(balcao);

    // Lousa na parede.
    const textura = texturaDeTexto('Café do dia · Bolo de laranja', {
      largura: 768,
      altura: 256,
      fundo: '#2f3a2c',
      cor: '#f6ecdb',
      fonte: '500 52px "Fraunces Variable", Georgia, serif',
    });
    const lousa = new Mesh(
      new PlaneGeometry(2.2, 0.75),
      textura
        ? new MeshStandardMaterial({ map: textura, roughness: 0.9 })
        : materialFosco(0x2f3a2c),
    );
    lousa.position.set(5.2, 2.15, -4.965); // à frente da moldura (evita z-fighting)
    this.grupo.add(caixa(2.32, 0.87, 0.04, materialFosco(PALETA.madeira), 5.2, 2.15, -5.0), lousa);
  }

  private montarMesa(): void {
    const madeira = materialFosco(PALETA.madeiraClara);
    const escura = materialFosco(PALETA.marrom);
    const mesa = new Group();
    mesa.position.set(MESA.x, 0, MESA.z);
    const tampo = new Mesh(new CylinderGeometry(0.75, 0.75, 0.05, 20), madeira);
    tampo.position.y = MESA.altura;
    const pe = new Mesh(new CylinderGeometry(0.06, 0.06, MESA.altura, 8), escura);
    pe.position.y = MESA.altura / 2;
    const base = new Mesh(new CylinderGeometry(0.35, 0.4, 0.04, 12), escura);
    base.position.y = 0.02;
    [tampo, pe, base].forEach((m) => {
      m.castShadow = true;
      m.receiveShadow = true;
    });
    mesa.add(tampo, pe, base);

    // Duas cadeiras.
    [-1.05, 1.05].forEach((dx) => {
      const cadeira = new Group();
      cadeira.position.set(dx, 0, 0.15);
      cadeira.rotation.y = dx > 0 ? -Math.PI / 2 : Math.PI / 2;
      cadeira.add(
        caixa(0.45, 0.05, 0.45, materialFosco(PALETA.verde), 0, 0.46, 0),
        caixa(0.45, 0.5, 0.05, materialFosco(PALETA.verde), 0, 0.72, -0.2),
        ...[
          [-0.19, -0.19],
          [0.19, -0.19],
          [-0.19, 0.19],
          [0.19, 0.19],
        ].map(([x, z]) => caixa(0.04, 0.46, 0.04, escura, x, 0.23, z)),
      );
      mesa.add(cadeira);
    });
    this.grupo.add(mesa);
  }

  private montarItens(): void {
    const y = MESA.altura + 0.025;

    // Notebook: base + tela inclinada, tela acesa.
    const notebook = new Group();
    const corpo = this.materialItem(0x7d7770);
    const tela = this.materialItem(PALETA.cremeClaro, 0.25);
    notebook.add(caixa(0.4, 0.02, 0.28, corpo, 0, 0.01, 0));
    const telaGrupo = new Group();
    telaGrupo.position.set(0, 0.02, -0.14);
    telaGrupo.rotation.x = -0.28;
    telaGrupo.add(
      caixa(0.4, 0.26, 0.015, corpo, 0, 0.13, 0),
      caixa(0.36, 0.22, 0.004, tela, 0, 0.13, 0.01),
    );
    notebook.add(telaGrupo);
    notebook.position.set(MESA.x - 0.2, y, MESA.z - 0.1);
    notebook.rotation.y = 0.3;
    this.adicionarItem('apresentacao', 'Notebook · Apresentação', notebook, [corpo, tela]);

    // Cardápio em pé (formato de tenda).
    const cardapio = new Group();
    const papel = this.materialItem(PALETA.creme);
    const capa = this.materialItem(PALETA.verdeEscuro);
    [-0.25, 0.25].forEach((angulo, i) => {
      const folha = caixa(0.2, 0.26, 0.008, i ? papel : capa, 0, 0.12, i ? -0.03 : 0.03);
      folha.rotation.x = angulo;
      cardapio.add(folha);
    });
    cardapio.position.set(MESA.x + 0.3, y, MESA.z - 0.25);
    cardapio.rotation.y = -0.4;
    this.adicionarItem('trajetoria', 'Cardápio · Trajetória', cardapio, [papel, capa]);

    // Pasta (currículo).
    const pasta = new Group();
    const couro = this.materialItem(PALETA.terracota);
    pasta.add(
      caixa(0.32, 0.03, 0.24, couro, 0, 0.015, 0),
      caixa(0.1, 0.01, 0.04, couro, 0.08, 0.035, -0.1),
    );
    pasta.position.set(MESA.x + 0.15, y, MESA.z + 0.3);
    pasta.rotation.y = 0.2;
    this.adicionarItem('contato', 'Pasta · Contato e currículo', pasta, [couro]);

    // Xícara de café, só decoração.
    this.grupo.add(this.xicara(materialFosco(PALETA.cremeClaro), MESA.x - 0.35, y, MESA.z + 0.3));
  }

  private materialItem(cor: number, emissivo = 0): MeshStandardMaterial {
    return new MeshStandardMaterial({
      color: cor,
      emissive: new Color(emissivo ? cor : PALETA.amarelo),
      emissiveIntensity: emissivo,
      roughness: 0.7,
      flatShading: true,
    });
  }

  private adicionarItem(
    id: PainelCafe,
    rotulo: string,
    grupo: Group,
    materiais: MeshStandardMaterial[],
  ): void {
    // Caixa invisível maior que o objeto: alvo de clique/toque mais generoso.
    const area = caixa(0.46, 0.36, 0.42, new MeshStandardMaterial({ visible: false }), 0, 0.15, 0);
    area.castShadow = false;
    grupo.add(area);
    this.alvos.push(...marcarInterativo(grupo, { tipo: 'cafe', id, rotulo }));
    grupo.name = `cafe__${id}`;
    marcarDinamico(grupo);
    this.grupo.add(grupo);
    this.itens.push({ id, grupo, materiais, brilho: 0 });
  }

  private xicara(material: MeshStandardMaterial, x: number, y: number, z: number): Group {
    const xicara = new Group();
    const copo = new Mesh(new CylinderGeometry(0.05, 0.04, 0.08, 10), material);
    copo.position.y = 0.04;
    const asa = new Mesh(new TorusGeometry(0.025, 0.008, 6, 10), material);
    asa.position.set(0.055, 0.045, 0);
    const cafe = new Mesh(
      new CylinderGeometry(0.045, 0.045, 0.005, 10),
      materialFosco(PALETA.marromEscuro),
    );
    cafe.position.y = 0.075;
    xicara.add(copo, asa, cafe);
    xicara.position.set(x, y, z);
    return xicara;
  }
}
