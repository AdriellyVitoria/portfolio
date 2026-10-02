import type { Skill } from '../../models';

// Skills reais (definidas no contexto do projeto).
export const SKILLS_MOCK: readonly Skill[] = [
  { id: 'angular', nome: 'Angular', categoria: 'FRONTEND', destaque: true, ordem: 1 },
  { id: 'typescript', nome: 'TypeScript', categoria: 'FRONTEND', destaque: false, ordem: 2 },
  { id: 'html', nome: 'HTML', categoria: 'FRONTEND', destaque: false, ordem: 3 },
  { id: 'scss', nome: 'SCSS', categoria: 'FRONTEND', destaque: false, ordem: 4 },
  { id: 'ux-ui', nome: 'UX/UI', categoria: 'FRONTEND', destaque: false, ordem: 5 },
  { id: 'java', nome: 'Java', categoria: 'BACKEND', destaque: true, ordem: 6 },
  { id: 'spring-boot', nome: 'Spring Boot', categoria: 'BACKEND', destaque: true, ordem: 7 },
  { id: 'groovy-grails', nome: 'Groovy/Grails', categoria: 'BACKEND', destaque: false, ordem: 8 },
  { id: 'apis-rest', nome: 'APIs REST', categoria: 'BACKEND', destaque: false, ordem: 9 },
  { id: 'postgresql', nome: 'PostgreSQL', categoria: 'BANCO', destaque: true, ordem: 10 },
  { id: 'mysql', nome: 'MySQL', categoria: 'BANCO', destaque: false, ordem: 11 },
  { id: 'sql', nome: 'SQL', categoria: 'BANCO', destaque: false, ordem: 12 },
  { id: 'kafka', nome: 'Kafka', categoria: 'OUTROS', destaque: false, ordem: 13 },
  { id: 'docker', nome: 'Docker', categoria: 'OUTROS', destaque: false, ordem: 14 },
  { id: 'git', nome: 'Git', categoria: 'OUTROS', destaque: false, ordem: 15 },
  { id: 'ia-llms', nome: 'IA / LLMs', categoria: 'OUTROS', destaque: true, ordem: 16 },
];
