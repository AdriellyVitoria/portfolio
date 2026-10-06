import type { Acao } from '../../models';
import { saiDoCafe } from '../../aurora/aurora.regras';
import { normalizar, responderLocalmente } from './aurora.respostas';
import { PERFIL } from './perfil.dados';
import { PROJETOS } from './projetos.dados';
import { SKILLS } from './skills.dados';

const dados = { projetos: PROJETOS, skills: SKILLS, perfil: PERFIL };
const responder = (pergunta: string) => responderLocalmente(pergunta, dados);
const tipos = (acoes: Acao[]) => acoes.map((a) => a.tipo);

describe('Aurora (respostas locais)', () => {
  it('normaliza acentos, maiúsculas e pontuação', () => {
    expect(normalizar('  Você SABE Programação?! ')).toBe('voce sabe programacao');
  });

  // Tabela de frases → ações esperadas. Cobre acentos, sinônimos e variações.
  it.each<[string, Acao[]]>([
    [
      'Quais projetos usam Java?',
      [
        { tipo: 'NAVEGAR', destino: 'livraria' },
        { tipo: 'DESTACAR_PROJETOS', tecnologia: 'java' },
      ],
    ],
    [
      'tem algo com KAFKA?',
      [
        { tipo: 'NAVEGAR', destino: 'livraria' },
        { tipo: 'DESTACAR_PROJETOS', tecnologia: 'kafka' },
      ],
    ],
    [
      'ela trabalha com postgres?',
      [
        { tipo: 'NAVEGAR', destino: 'livraria' },
        { tipo: 'DESTACAR_PROJETOS', tecnologia: 'postgresql' },
      ],
    ],
    [
      'Ela usa inteligência artificial?',
      [
        { tipo: 'NAVEGAR', destino: 'livraria' },
        { tipo: 'DESTACAR_PROJETOS', tecnologia: 'ia-llms' },
      ],
    ],
    [
      'projetos com spring data',
      [
        { tipo: 'NAVEGAR', destino: 'livraria' },
        { tipo: 'DESTACAR_PROJETOS', tecnologia: 'spring-data-jpa' },
      ],
    ],
    [
      'me fala do NF-e',
      [
        { tipo: 'NAVEGAR', destino: 'livraria' },
        { tipo: 'ABRIR_PROJETO', projetoId: 'nfe-estudo' },
      ],
    ],
    ['me leva para a floricultura', [{ tipo: 'NAVEGAR', destino: 'floricultura' }]],
    ['Onde a Adrielly trabalha?', [{ tipo: 'ABRIR_PAINEL', painel: 'trajetoria' }]],
    ['qual a formação dela?', [{ tipo: 'ABRIR_PAINEL', painel: 'trajetoria' }]],
    ['Como entro em contato?', [{ tipo: 'ABRIR_PAINEL', painel: 'contato' }]],
    ['tem currículo?', [{ tipo: 'ABRIR_PAINEL', painel: 'contato' }]],
    [
      'quais tecnologias ela usa?',
      [{ tipo: 'NAVEGAR', destino: 'floricultura' }, { tipo: 'LIMPAR_DESTAQUE' }],
    ],
    [
      'quais projetos tem no portfólio?',
      [{ tipo: 'NAVEGAR', destino: 'livraria' }, { tipo: 'LIMPAR_DESTAQUE' }],
    ],
    ['oi!', []],
    ['obrigada', []],
  ])('"%s"', (pergunta, acoesEsperadas) => {
    expect(responder(pergunta).acoes).toEqual(acoesEsperadas);
  });

  it('lista os projetos certos e não confunde Java com JavaScript', () => {
    const { mensagem } = responder('projetos com Java');

    PROJETOS.filter((p) => p.tecnologias.includes('java')).forEach((p) =>
      expect(mensagem).toContain(p.nome),
    );
    expect(mensagem).not.toContain('Portfólio 3D');
  });

  it('skill sem projeto: mostra o vaso e cita onde é usada no trabalho', () => {
    const resposta = responder('ela sabe Redis?');

    expect(resposta.mensagem).toContain('ZG Soluções');
    expect(tipos(resposta.acoes)).toEqual(['NAVEGAR', 'DESTACAR_PROJETOS']);
    expect(resposta.acoes[0]).toEqual({ tipo: 'NAVEGAR', destino: 'floricultura' });
  });

  it('tecnologia que não está nas skills: diz que não encontrou', () => {
    const resposta = responder('ela sabe Rust?');

    expect(resposta.mensagem).toMatch(/não encontrei/i);
    expect(resposta.acoes).toContainEqual({ tipo: 'NAVEGAR', destino: 'floricultura' });
  });

  it('pergunta fora do portfólio: não inventa e sugere perguntas', () => {
    const resposta = responder('qual a capital da França?');

    expect(resposta.mensagem).toMatch(/não está no portfólio/);
    expect(resposta.acoes).toEqual([]);
    expect(resposta.sugestoes?.length).toBeGreaterThan(0);
  });

  it('a experiência vem do currículo', () => {
    expect(responder('onde ela trabalha?').mensagem).toContain('ZG Soluções');
  });

  it('identifica ações que levam para fora do café', () => {
    expect(saiDoCafe([{ tipo: 'NAVEGAR', destino: 'livraria' }])).toBe(true);
    expect(saiDoCafe([{ tipo: 'NAVEGAR', destino: 'cafe' }])).toBe(false);
    expect(saiDoCafe([{ tipo: 'ABRIR_PAINEL', painel: 'contato' }])).toBe(false);
  });
});
