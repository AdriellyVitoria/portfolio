import {
  AmbientLight,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  DoubleSide,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  PointLight,
  SphereGeometry,
  Vector3,
} from 'three';

import { PALETA } from '../paleta';
import type { ConfigQualidade } from '../qualidade';
import type { AncoraRotulo } from '../rotulos';
import type { ParteCena } from '../tipos';
import { caixa, fundirEstaticos, marcarDinamico, materialFosco } from '../util';

const FACHADA_Z = 4;
const LARGURA = 16;
const PROFUNDIDADE = 9; // de z = -5 a z = 4
const ALTURA = 3.6;
const PORTA_LARGURA = 2.6;
const PORTA_ALTURA = 2.7;

/** Construção, rua e iluminação. Tudo estático, exceto o leve balanço das luminárias. */
export class Ambiente implements ParteCena {
  readonly grupo = new Group();
  /** Paredes e fachada: bloqueiam cliques "através" delas. */
  readonly oclusores: Object3D[] = [];
  private readonly luminarias: Group[] = [];

  constructor(qualidade: ConfigQualidade) {
    this.grupo.name = 'ambiente';
    this.montarRua();
    this.montarInterior();
    this.montarFachada();
    this.montarLuminarias(qualidade);
    this.montarDecoracao();
    this.montarLuzes(qualidade);
    fundirEstaticos(this.grupo);
  }

  /** Placa da fachada (HTML): só aparece da rua. */
  ancoras(): AncoraRotulo[] {
    return [
      {
        id: 'fachada',
        posicao: new Vector3(0, ALTURA - 0.42, FACHADA_Z + 0.2),
        alinhamento: 'centro',
        areas: ['entrada'],
        distanciaReferencia: 7.5,
      },
    ];
  }

  update(_dt: number, tempo: number): void {
    this.luminarias.forEach((luminaria, i) => {
      luminaria.rotation.z = Math.sin(tempo * 0.6 + i) * 0.015;
    });
  }

  private montarRua(): void {
    const chao = new Mesh(new PlaneGeometry(40, 16), materialFosco(PALETA.pedra));
    chao.rotation.x = -Math.PI / 2;
    chao.position.set(0, -0.01, FACHADA_Z + 8);
    chao.receiveShadow = true;
    this.grupo.add(chao);

    // Paralelepípedos: centenas de pedras num único InstancedMesh (1 draw call).
    const posicoes: [number, number][] = [];
    for (let x = -9; x <= 9; x += 0.55) {
      for (let z = FACHADA_Z + 0.4; z <= FACHADA_Z + 10; z += 0.5) {
        if (Math.random() > 0.35) posicoes.push([x, z]);
      }
    }
    const pedras = new InstancedMesh(
      new CylinderGeometry(0.22, 0.24, 0.05, 6),
      materialFosco(0xb3a596),
      posicoes.length,
    );
    const matriz = new Object3D();
    posicoes.forEach(([x, z], i) => {
      matriz.position.set(x + (Math.random() - 0.5) * 0.15, 0, z + (Math.random() - 0.5) * 0.15);
      matriz.rotation.y = Math.random() * Math.PI;
      matriz.updateMatrix();
      pedras.setMatrixAt(i, matriz.matrix);
    });
    pedras.receiveShadow = true;
    this.grupo.add(pedras);
  }

  private montarInterior(): void {
    const piso = new Mesh(
      new PlaneGeometry(LARGURA, PROFUNDIDADE),
      materialFosco(PALETA.madeiraClara),
    );
    piso.rotation.x = -Math.PI / 2;
    piso.position.set(0, 0, FACHADA_Z - PROFUNDIDADE / 2);
    piso.receiveShadow = true;
    this.grupo.add(piso);

    // Tábuas do piso: frisos finos e escuros.
    const friso = materialFosco(PALETA.madeira);
    for (let x = -LARGURA / 2 + 0.6; x < LARGURA / 2; x += 0.6) {
      const linha = caixa(0.02, 0.005, PROFUNDIDADE, friso, x, 0.003, FACHADA_Z - PROFUNDIDADE / 2);
      linha.castShadow = false;
      this.grupo.add(linha);
    }

    const parede = materialFosco(PALETA.parede);
    const fundo = caixa(LARGURA, ALTURA, 0.2, parede, 0, ALTURA / 2, -5.1);
    const esquerda = caixa(0.2, ALTURA, PROFUNDIDADE, parede, -LARGURA / 2 - 0.1, ALTURA / 2, -0.5);
    const direita = caixa(0.2, ALTURA, PROFUNDIDADE, parede, LARGURA / 2 + 0.1, ALTURA / 2, -0.5);
    // Rodapé de madeira.
    const rodape = caixa(LARGURA, 0.18, 0.06, materialFosco(PALETA.madeira), 0, 0.09, -4.98);
    this.grupo.add(fundo, esquerda, direita, rodape);
    this.oclusores.push(fundo, esquerda, direita);

    // Tapete redondo em frente à floricultura.
    const tapete = new Mesh(new CircleGeometry(1.6, 24), materialFosco(PALETA.terracota));
    tapete.rotation.x = -Math.PI / 2;
    tapete.position.set(0, 0.006, -1.4);
    tapete.receiveShadow = true;
    const borda = new Mesh(new CircleGeometry(1.75, 24), materialFosco(PALETA.amarelo));
    borda.rotation.x = -Math.PI / 2;
    borda.position.set(0, 0.004, -1.4);
    this.grupo.add(borda, tapete);
  }

  private montarFachada(): void {
    const madeira = materialFosco(PALETA.madeira);
    const lateral = (LARGURA - PORTA_LARGURA) / 2;
    const xLateral = PORTA_LARGURA / 2 + lateral / 2;

    const esquerda = caixa(lateral, ALTURA, 0.25, madeira, -xLateral, ALTURA / 2, FACHADA_Z);
    const direita = caixa(lateral, ALTURA, 0.25, madeira, xLateral, ALTURA / 2, FACHADA_Z);
    const verga = caixa(
      PORTA_LARGURA,
      ALTURA - PORTA_ALTURA,
      0.25,
      madeira,
      0,
      PORTA_ALTURA + (ALTURA - PORTA_ALTURA) / 2,
      FACHADA_Z,
    );
    this.grupo.add(esquerda, direita, verga);
    this.oclusores.push(esquerda, direita, verga);

    // Ripas verticais dão textura de madeira à fachada.
    const ripa = materialFosco(PALETA.marrom);
    for (let x = -LARGURA / 2 + 0.4; x < LARGURA / 2; x += 0.8) {
      if (Math.abs(x) < PORTA_LARGURA / 2 + 0.1) continue;
      this.grupo.add(caixa(0.06, ALTURA, 0.04, ripa, x, ALTURA / 2, FACHADA_Z + 0.14));
    }

    // Batente e porta aberta (girada para dentro).
    const batente = materialFosco(PALETA.verdeEscuro);
    this.grupo.add(
      caixa(0.12, PORTA_ALTURA, 0.3, batente, -PORTA_LARGURA / 2, PORTA_ALTURA / 2, FACHADA_Z),
      caixa(0.12, PORTA_ALTURA, 0.3, batente, PORTA_LARGURA / 2, PORTA_ALTURA / 2, FACHADA_Z),
      caixa(PORTA_LARGURA + 0.12, 0.12, 0.3, batente, 0, PORTA_ALTURA, FACHADA_Z),
    );
    const porta = new Group();
    porta.add(
      caixa(
        1.2,
        PORTA_ALTURA - 0.1,
        0.06,
        materialFosco(PALETA.verde),
        0.6,
        (PORTA_ALTURA - 0.1) / 2,
        0,
      ),
    );
    porta.position.set(-PORTA_LARGURA / 2 + 0.06, 0, FACHADA_Z - 0.1);
    porta.rotation.y = -1.9;
    this.grupo.add(porta);

    // Vitrines dos dois lados, com luz quente "vazando".
    const vidro = new MeshStandardMaterial({
      color: PALETA.luzQuente,
      emissive: PALETA.luzQuente,
      emissiveIntensity: 0.35,
      roughness: 0.3,
    });
    [-4.6, 4.6].forEach((x) => {
      this.grupo.add(
        caixa(2.6, 1.5, 0.05, vidro, x, 1.6, FACHADA_Z + 0.14),
        caixa(2.8, 0.1, 0.12, batente, x, 0.82, FACHADA_Z + 0.16),
        caixa(2.8, 0.1, 0.12, batente, x, 2.38, FACHADA_Z + 0.16),
      );
    });

    // A placa sobre a porta é HTML preso a esta posição (ver ancoras()).

    // Toldo listrado acima da placa.
    const listras = [PALETA.terracota, PALETA.creme];
    for (let i = 0; i < 12; i++) {
      const faixa = caixa(
        0.5,
        0.04,
        0.9,
        materialFosco(listras[i % 2]),
        -2.75 + i * 0.5,
        ALTURA + 0.05,
        FACHADA_Z + 0.5,
      );
      faixa.rotation.x = 0.35;
      this.grupo.add(faixa);
    }
  }

  private montarLuminarias(qualidade: ConfigQualidade): void {
    const cupula = materialFosco(PALETA.verdeEscuro, { side: DoubleSide });
    const lampada = new MeshBasicMaterial({ color: PALETA.luzQuente });
    const fio = materialFosco(PALETA.marromEscuro);

    [-5, 0, 5].forEach((x) => {
      const luminaria = marcarDinamico(new Group());
      luminaria.position.set(x, ALTURA, -2.2);
      const cabo = new Mesh(new CylinderGeometry(0.01, 0.01, 0.4), fio);
      cabo.position.y = -0.2;
      const abajur = new Mesh(new ConeGeometry(0.32, 0.3, 12, 1, true), cupula);
      abajur.position.y = -0.55;
      const bulbo = new Mesh(new SphereGeometry(0.08, 10, 8), lampada);
      bulbo.position.y = -0.63;
      luminaria.add(cabo, abajur, bulbo);

      const luz = new PointLight(PALETA.luzQuente, 6, 7, 1.6);
      luz.position.y = -0.7;
      luz.castShadow = false;
      luminaria.add(luz);

      this.luminarias.push(luminaria);
      this.grupo.add(luminaria);
    });

    // Lampião na rua, ao lado da porta.
    if (qualidade.nivel !== 'baixa') {
      const poste = caixa(0.08, 2.6, 0.08, fio, 2.2, 1.3, FACHADA_Z + 1.2);
      const lanterna = new Mesh(new SphereGeometry(0.14, 10, 8), lampada);
      lanterna.position.set(2.2, 2.7, FACHADA_Z + 1.2);
      const luz = new PointLight(PALETA.luzQuente, 3, 6, 1.8);
      luz.position.copy(lanterna.position);
      this.grupo.add(poste, lanterna, luz);
    }
  }

  private montarDecoracao(): void {
    // Vasos grandes nos cantos e ao lado da porta.
    const vaso = materialFosco(PALETA.terracota);
    const folhagem = materialFosco(PALETA.verde);
    const posicoes: [number, number][] = [
      [-7.3, -4.4],
      [7.3, -4.4],
      [-7.3, 3.3],
      [7.3, 3.3],
      [-1.9, FACHADA_Z + 0.6],
    ];
    posicoes.forEach(([x, z]) => {
      const planta = new Group();
      const base = new Mesh(new CylinderGeometry(0.3, 0.22, 0.5, 8), vaso);
      base.position.y = 0.25;
      const copa = new Mesh(new IcosahedronGeometry(0.55, 0), folhagem);
      copa.position.y = 0.95;
      copa.scale.y = 1.3;
      [base, copa].forEach((m) => (m.castShadow = true));
      planta.add(base, copa);
      planta.position.set(x, 0, z);
      this.grupo.add(planta);
    });

    // Quadros nas paredes laterais (a parede do fundo é da estante, da étagère e do balcão).
    const moldura = materialFosco(PALETA.marrom);
    [
      { lado: -1, cor: PALETA.rosa },
      { lado: 1, cor: PALETA.lilas },
    ].forEach(({ lado, cor }) => {
      this.grupo.add(
        caixa(0.05, 0.8, 1.0, moldura, lado * 7.97, 2.2, 0.2),
        caixa(0.02, 0.64, 0.84, materialFosco(cor), lado * 7.94, 2.2, 0.2),
      );
    });
  }

  private montarLuzes(qualidade: ConfigQualidade): void {
    // Luz de céu/chão: preenchimento quente e suave.
    this.grupo.add(new HemisphereLight(0xfff1dc, PALETA.madeira, 1.3));
    this.grupo.add(new AmbientLight(0xffe8cc, 0.25));

    // "Sol" de fim de tarde entrando pela porta e vitrines.
    const sol = new DirectionalLight(0xffd29a, 2.2);
    sol.position.set(-6, 9, 12);
    sol.target.position.set(0, 0, -2);
    if (qualidade.sombras) {
      sol.castShadow = true;
      sol.shadow.mapSize.set(
        qualidade.nivel === 'alta' ? 2048 : 1024,
        qualidade.nivel === 'alta' ? 2048 : 1024,
      );
      sol.shadow.camera.left = -10;
      sol.shadow.camera.right = 10;
      sol.shadow.camera.top = 10;
      sol.shadow.camera.bottom = -10;
      sol.shadow.camera.far = 40;
      sol.shadow.bias = -0.0005;
      sol.shadow.normalBias = 0.02;
    }
    this.grupo.add(sol, sol.target);
  }
}
