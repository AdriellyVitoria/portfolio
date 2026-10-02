import type { Perfil } from '../../models';

// ⚠️ PLACEHOLDER — só nome, título e GitHub são reais. Substituir o restante.
export const PERFIL_MOCK: Perfil = {
  nome: 'Adrielly',
  titulo: 'Desenvolvedora Full Stack',
  apresentacao: '[Exemplo] Texto de apresentação a ser escrito.',
  objetivos: '[Exemplo] Objetivos profissionais a serem escritos.',
  experiencias: [
    {
      id: 'experiencia-exemplo-1',
      empresa: '[Exemplo] Empresa',
      cargo: '[Exemplo] Cargo',
      inicio: '2024-01',
      descricao: '[Exemplo] Descrição das atividades.',
      tecnologias: ['java', 'spring-boot', 'angular'],
    },
  ],
  formacoes: [
    {
      id: 'formacao-exemplo-1',
      instituicao: '[Exemplo] Instituição',
      curso: '[Exemplo] Curso',
      inicio: '2020-01',
      fim: '2023-12',
    },
  ],
  links: [
    { tipo: 'GITHUB', url: 'https://github.com/AdriellyVitoria', rotulo: 'GitHub' },
    { tipo: 'LINKEDIN', url: 'https://www.linkedin.com/', rotulo: 'LinkedIn (exemplo)' },
  ],
  curriculoUrl: '/curriculo/curriculo.pdf',
  placeholder: true,
};
