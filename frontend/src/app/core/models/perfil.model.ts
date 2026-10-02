export type TipoLink = 'LINKEDIN' | 'GITHUB' | 'EMAIL' | 'OUTRO';

export interface Link {
  tipo: TipoLink;
  url: string;
  rotulo: string;
}

export interface Experiencia {
  id: string;
  empresa: string;
  cargo: string;
  /** ISO 'YYYY-MM'. */
  inicio: string;
  /** Ausente = emprego atual. */
  fim?: string;
  descricao: string;
  /** Ids de Skill. */
  tecnologias: string[];
}

export interface Formacao {
  id: string;
  instituicao: string;
  curso: string;
  inicio: string;
  fim?: string;
}

export interface Perfil {
  nome: string;
  titulo: string;
  apresentacao: string;
  objetivos: string;
  experiencias: Experiencia[];
  formacoes: Formacao[];
  links: Link[];
  curriculoUrl: string;
  placeholder?: boolean;
}
