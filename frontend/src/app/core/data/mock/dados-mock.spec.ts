import { PERFIL_MOCK } from './perfil.mock';
import { PROJETOS_MOCK } from './projetos.mock';
import { SKILLS_MOCK } from './skills.mock';

// Integridade dos dados: as mesmas regras vão valer para o seed do backend.
describe('dados mock', () => {
  const idsSkills = new Set(SKILLS_MOCK.map((s) => s.id));

  it('não repete ids de skills nem de projetos', () => {
    expect(idsSkills.size).toBe(SKILLS_MOCK.length);
    expect(new Set(PROJETOS_MOCK.map((p) => p.id)).size).toBe(PROJETOS_MOCK.length);
  });

  it('usa ids em formato slug', () => {
    const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    [...SKILLS_MOCK, ...PROJETOS_MOCK].forEach((item) => expect(item.id).toMatch(slug));
  });

  it('só referencia skills existentes nos projetos e experiências', () => {
    const referencias = [
      ...PROJETOS_MOCK.flatMap((p) => p.tecnologias),
      ...PERFIL_MOCK.experiencias.flatMap((e) => e.tecnologias),
    ];
    referencias.forEach((id) => expect(idsSkills).toContain(id));
  });

  it('usa datas no formato YYYY-MM', () => {
    const anoMes = /^\d{4}-(0[1-9]|1[0-2])$/;
    [...PERFIL_MOCK.experiencias, ...PERFIL_MOCK.formacoes].forEach((item) => {
      expect(item.inicio).toMatch(anoMes);
      if (item.fim) expect(item.fim).toMatch(anoMes);
    });
  });
});
