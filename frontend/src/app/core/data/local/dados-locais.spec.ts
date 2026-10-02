import { CATEGORIAS_SKILL } from '../../models';
import { PERFIL } from './perfil.dados';
import { PROJETOS } from './projetos.dados';
import { SKILLS } from './skills.dados';

// Integridade dos dados: as mesmas regras vão valer para o seed do backend.
describe('dados locais', () => {
  const idsSkills = new Set(SKILLS.map((s) => s.id));

  it('não repete ids de skills nem de projetos', () => {
    expect(idsSkills.size).toBe(SKILLS.length);
    expect(new Set(PROJETOS.map((p) => p.id)).size).toBe(PROJETOS.length);
  });

  it('usa ids em formato slug', () => {
    const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    [...SKILLS, ...PROJETOS].forEach((item) => expect(item.id).toMatch(slug));
  });

  it('só referencia skills existentes nos projetos e experiências', () => {
    const referencias = [
      ...PROJETOS.flatMap((p) => p.tecnologias),
      ...PERFIL.experiencias.flatMap((e) => e.tecnologias),
    ];
    referencias.forEach((id) => expect(idsSkills).toContain(id));
  });

  it('usa datas no formato YYYY ou YYYY-MM', () => {
    const data = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
    [...PERFIL.experiencias, ...PERFIL.formacoes].forEach((item) => {
      if (item.inicio) expect(item.inicio).toMatch(data);
      if (item.fim) expect(item.fim).toMatch(data);
    });
  });

  it('todo projeto e experiência tem pelo menos uma tecnologia', () => {
    [...PROJETOS, ...PERFIL.experiencias].forEach((item) =>
      expect(item.tecnologias.length).toBeGreaterThan(0),
    );
  });

  it('toda categoria de skill usada existe na lista de categorias', () => {
    const categorias = new Set(CATEGORIAS_SKILL.map((c) => c.id));
    SKILLS.forEach((s) => expect(categorias).toContain(s.categoria));
  });
});
