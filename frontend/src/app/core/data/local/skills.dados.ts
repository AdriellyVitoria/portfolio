import type { CategoriaSkill, Skill } from '../../models';

// Fonte: currículo (habilidades técnicas) + Groovy/Grails, MySQL, SCSS, UX/UI e Docker
// do contexto do projeto. Destaques: Java, Spring Boot, Angular, PostgreSQL e IA.
const POR_CATEGORIA: Record<CategoriaSkill, [id: string, nome: string, destaque?: boolean][]> = {
  FRONTEND: [
    ['angular', 'Angular', true],
    ['typescript', 'TypeScript'],
    ['javascript', 'JavaScript'],
    ['angular-material', 'Angular Material'],
    ['vuejs', 'Vue.js'],
    ['html', 'HTML'],
    ['css', 'CSS'],
    ['scss', 'SCSS'],
    ['ux-ui', 'UX/UI'],
  ],
  BACKEND: [
    ['java', 'Java', true],
    ['spring-boot', 'Spring Boot', true],
    ['spring-mvc', 'Spring MVC'],
    ['spring-data-jpa', 'Spring Data JPA'],
    ['quarkus', 'Quarkus'],
    ['apis-rest', 'APIs REST'],
    ['groovy-grails', 'Groovy/Grails'],
  ],
  BANCO: [
    ['postgresql', 'PostgreSQL', true],
    ['oracle', 'Oracle'],
    ['mysql', 'MySQL'],
    ['sql', 'SQL'],
  ],
  MENSAGERIA: [
    ['kafka', 'Apache Kafka'],
    ['redis', 'Redis'],
  ],
  DEVOPS: [
    ['git', 'Git'],
    ['github-actions', 'GitHub Actions'],
    ['bitbucket-pipelines', 'Bitbucket Pipelines'],
    ['jenkins', 'Jenkins'],
    ['ci-cd', 'CI/CD'],
    ['docker', 'Docker'],
  ],
  IA: [
    ['ia-llms', 'IA / LLMs', true],
    ['claude', 'Claude'],
    ['github-copilot', 'GitHub Copilot'],
    ['codex', 'Codex'],
    ['agentes-ia', 'Agentes de IA'],
  ],
  PRATICAS: [
    ['microservicos', 'Microserviços'],
    ['clean-architecture', 'Clean Architecture'],
    ['testes', 'Testes unitários e de integração'],
    ['design-system', 'Design System'],
    ['scrum', 'Scrum'],
    ['kanban', 'Kanban'],
  ],
};

export const SKILLS: readonly Skill[] = Object.entries(POR_CATEGORIA)
  .flatMap(([categoria, skills]) =>
    skills.map(([id, nome, destaque = false]) => ({
      id,
      nome,
      categoria: categoria as CategoriaSkill,
      destaque,
    })),
  )
  .map((skill, i) => ({ ...skill, ordem: i + 1 }));
