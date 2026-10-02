export interface Projeto {
  /** Slug estável: usado na URL e no nome do objeto 3D (livro__<id>). */
  id: string;
  nome: string;
  descricaoCurta: string;
  problema: string;
  funcionalidades: string[];
  /** Ids de Skill. É o que liga a floricultura à livraria. */
  tecnologias: string[];
  githubUrl?: string;
  demoUrl?: string;
  /** Vai para a prateleira iluminada. */
  destaque: boolean;
  ordem: number;
  /** Nome de cor da paleta (ex.: 'terracota'), usado para gerar o livro 3D. */
  corCapa?: string;
}

export interface FiltroProjetos {
  /** Id de Skill. */
  tecnologia?: string;
}
