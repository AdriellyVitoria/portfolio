import {
  BoxGeometry,
  CanvasTexture,
  type BufferGeometry,
  InstancedMesh,
  type Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  SRGBColorSpace,
  type Texture,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import type { AlvoInterativo } from './tipos';

/** Marca um objeto que se move/anima: `fundirEstaticos` não mexe nele nem nos filhos. */
export function marcarDinamico<T extends Object3D>(objeto: T): T {
  objeto.userData['dinamico'] = true;
  return objeto;
}

function chaveMaterial(material: Material): string {
  const m = material as MeshStandardMaterial;
  return [
    m.type,
    m.color?.getHex(),
    m.emissive?.getHex(),
    m.emissiveIntensity,
    m.roughness,
    m.metalness,
    m.map?.uuid,
    m.transparent,
    m.opacity,
    m.side,
    m.visible,
    m.flatShading,
  ].join('|');
}

/**
 * Funde os meshes estáticos de um container que usam o mesmo material num único mesh.
 * Centenas de tábuas, ripas e degraus viram poucas chamadas de desenho.
 * Pula objetos clicáveis (precisam continuar separados para o raycasting),
 * objetos marcados como dinâmicos e InstancedMesh.
 */
export function fundirEstaticos(container: Object3D): void {
  container.updateMatrixWorld(true);
  const inversa = new Matrix4().copy(container.matrixWorld).invert();
  const grupos = new Map<string, Mesh[]>();

  const visitar = (objeto: Object3D) => {
    if (objeto.userData['dinamico'] || objeto.userData['alvo']) return;
    if (
      objeto instanceof Mesh &&
      !(objeto instanceof InstancedMesh) &&
      !Array.isArray(objeto.material)
    ) {
      const chave = chaveMaterial(objeto.material);
      grupos.set(chave, [...(grupos.get(chave) ?? []), objeto]);
    }
    objeto.children.forEach(visitar);
  };
  container.children.forEach(visitar);

  for (const meshes of grupos.values()) {
    if (meshes.length < 2) continue;
    const geometrias = meshes.map((mesh) => {
      const relativa = new Matrix4().multiplyMatrices(inversa, mesh.matrixWorld);
      const g = mesh.geometry.clone().applyMatrix4(relativa);
      return g.index ? g : null;
    });
    if (geometrias.some((g) => !g)) continue;
    const fundida = mergeGeometries(geometrias as BufferGeometry[]);
    geometrias.forEach((g) => g!.dispose());
    if (!fundida) continue;

    const unico = new Mesh(fundida, meshes[0].material);
    unico.castShadow = meshes.some((m) => m.castShadow);
    unico.receiveShadow = meshes.some((m) => m.receiveShadow);
    container.add(unico);
    meshes.forEach((mesh) => {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      if (mesh.material !== unico.material) (mesh.material as Material).dispose();
    });
  }
}

/** Material fosco com sombreamento facetado: dá o ar low-poly. */
export function materialFosco(cor: number, extra: Partial<MeshStandardMaterial> = {}) {
  return new MeshStandardMaterial({ color: cor, roughness: 0.85, flatShading: true, ...extra });
}

/** Caixa já posicionada, com sombras. Atalho para montar móveis. */
export function caixa(
  largura: number,
  altura: number,
  profundidade: number,
  material: Material,
  x = 0,
  y = 0,
  z = 0,
): Mesh {
  const mesh = new Mesh(new BoxGeometry(largura, altura, profundidade), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Marca todos os meshes do objeto como clicáveis e devolve a lista deles. */
export function marcarInterativo(objeto: Object3D, alvo: AlvoInterativo): Mesh[] {
  const meshes: Mesh[] = [];
  objeto.traverse((filho) => {
    if (filho instanceof Mesh) {
      filho.userData['alvo'] = alvo;
      meshes.push(filho);
    }
  });
  return meshes;
}

export interface OpcoesTexto {
  largura?: number;
  altura?: number;
  fundo?: string;
  cor?: string;
  fonte?: string;
}

/**
 * Texto desenhado num canvas 2D e usado como textura (plaquinhas, placa da fachada).
 * Devolve `null` onde não há canvas 2D (ex.: testes em jsdom).
 */
export function texturaDeTexto(texto: string, opcoes: OpcoesTexto = {}): CanvasTexture | null {
  const {
    largura = 256,
    altura = 64,
    fundo = '#fbf6ee',
    cor = '#3b261b',
    fonte = '600 30px "Inter Variable", system-ui, sans-serif',
  } = opcoes;
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, largura, altura);
  ctx.fillStyle = cor;
  ctx.font = fonte;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, largura / 2, altura / 2, largura - 16);

  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace;
  textura.anisotropy = 4;
  return textura;
}

/** Libera da GPU geometrias, materiais e texturas de um objeto e de todos os filhos. */
export function descartar(objeto: Object3D): void {
  objeto.traverse((filho) => {
    const mesh = filho as Partial<Mesh>;
    (mesh.geometry as BufferGeometry | undefined)?.dispose();
    const materiais = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materiais.forEach((material) => {
      if (!material) return;
      Object.values(material).forEach((valor) => {
        if ((valor as Texture | null)?.isTexture) (valor as Texture).dispose();
      });
      material.dispose();
    });
  });
}
