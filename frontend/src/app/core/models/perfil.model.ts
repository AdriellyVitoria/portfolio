export type TipoLink = 'LINKEDIN' | 'GITHUB' | 'EMAIL' | 'OUTRO';

export interface Link {
  tipo: TipoLink;
  url: string;
  rotulo: string;
}

/** 'YYYY' ou 'YYYY-MM' (quando o mês não é conhecido, só o ano). */
export type DataParcial = string;

export interface Experiencia {
  id: string;
  empresa: string;
  cargo: string;
  inicio: DataParcial;
  /** Ausente = emprego atual. */
  fim?: DataParcial;
  /** Ex.: 'Remoto'. */
  modalidade?: string;
  /** Uma frase de resumo. */
  descricao: string;
  /** Principais atividades (os tópicos do currículo). */
  atividades: string[];
  /** Ids de Skill. */
  tecnologias: string[];
}

export interface Formacao {
  id: string;
  curso: string;
  instituicao: string;
  inicio?: DataParcial;
  fim?: DataParcial;
}

export interface Perfil {
  nome: string;
  titulo: string;
  localizacao?: string;
  apresentacao: string;
  /** Opcional: a seção só aparece quando existir. */
  objetivos?: string;
  experiencias: Experiencia[];
  formacoes: Formacao[];
  links: Link[];
  /** Ausente = sem currículo para download. */
  curriculoUrl?: string;
}
