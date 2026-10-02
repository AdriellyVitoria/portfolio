export type CategoriaSkill =
  'FRONTEND' | 'BACKEND' | 'BANCO' | 'MENSAGERIA' | 'DEVOPS' | 'IA' | 'PRATICAS';

/** Ordem e nomes das categorias. Fonte única para o modo simples e a cena 3D. */
export const CATEGORIAS_SKILL: readonly {
  id: CategoriaSkill;
  rotulo: string;
  rotuloCurto: string;
}[] = [
  { id: 'FRONTEND', rotulo: 'Frontend', rotuloCurto: 'Frontend' },
  { id: 'BACKEND', rotulo: 'Backend', rotuloCurto: 'Backend' },
  { id: 'BANCO', rotulo: 'Banco de dados', rotuloCurto: 'Banco' },
  { id: 'MENSAGERIA', rotulo: 'Mensageria e cache', rotuloCurto: 'Mensageria' },
  { id: 'DEVOPS', rotulo: 'DevOps e ferramentas', rotuloCurto: 'DevOps' },
  { id: 'IA', rotulo: 'IA e desenvolvimento assistido', rotuloCurto: 'IA' },
  { id: 'PRATICAS', rotulo: 'Arquitetura, testes e métodos', rotuloCurto: 'Práticas' },
];

export interface Skill {
  /** Slug estável (ex.: 'spring-boot'). É o que os projetos referenciam. */
  id: string;
  nome: string;
  categoria: CategoriaSkill;
  /** Tecnologias principais (Java, Spring Boot, Angular, PostgreSQL, IA). */
  destaque: boolean;
  ordem: number;
}
