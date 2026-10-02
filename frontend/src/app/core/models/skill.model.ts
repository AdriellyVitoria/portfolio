export type CategoriaSkill = 'FRONTEND' | 'BACKEND' | 'BANCO' | 'OUTROS';

export interface Skill {
  /** Slug estável (ex.: 'spring-boot'). É o que os projetos referenciam. */
  id: string;
  nome: string;
  categoria: CategoriaSkill;
  /** Tecnologias principais (Java, Spring Boot, Angular, PostgreSQL, IA). */
  destaque: boolean;
  ordem: number;
}
