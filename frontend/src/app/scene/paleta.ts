// Paleta da cena. Espelha src/styles/_tokens.scss: se mudar lá, mude aqui.
export const PALETA = {
  terracota: 0xb85a3c,
  laranja: 0xd9772b,
  amarelo: 0xe8b54a,
  verde: 0x5f7a4a,
  verdeEscuro: 0x3f5634,
  marrom: 0x6b4430,
  marromEscuro: 0x3b261b,
  creme: 0xf6ecdb,
  cremeClaro: 0xfbf6ee,
  rosa: 0xd99a9e,
  lilas: 0xa58cb3,
  // Tons de apoio, só da cena
  madeira: 0x8a5a3b,
  madeiraClara: 0xb07a52,
  parede: 0xeedcc3,
  pedra: 0x9c8f84,
  luzQuente: 0xffd9a0,
} as const;

/** Cores aceitas em `Projeto.corCapa`. */
const CORES_CAPA: Record<string, number> = {
  terracota: PALETA.terracota,
  laranja: PALETA.laranja,
  amarelo: PALETA.amarelo,
  verde: PALETA.verde,
  marrom: PALETA.marrom,
  creme: PALETA.creme,
  rosa: PALETA.rosa,
  lilas: PALETA.lilas,
};

export function corDaCapa(nome: string | undefined): number {
  return (nome && CORES_CAPA[nome]) || PALETA.terracota;
}
