import { SUGESTOES_INICIAIS } from '../../aurora/aurora.regras';
import type { Area, Perfil, Projeto, RespostaChat, Skill } from '../../models';
import { CATEGORIAS_SKILL } from '../../models';

/**
 * "Cérebro" local da Aurora: entende a pergunta por palavras-gatilho e sinônimos e
 * monta a resposta com os dados reais do portfólio. Função pura (fácil de testar).
 *
 * Não é NLP: é uma lista ordenada de regras (uma por intenção). Quando nenhuma se
 * aplica, diz que não sabe e sugere perguntas. Com o backend, o Gemini assume este
 * papel com o mesmo contrato (`RespostaChat`).
 */
export interface DadosAurora {
  projetos: readonly Projeto[];
  skills: readonly Skill[];
  perfil: Perfil;
}

// Apelidos que as pessoas usam para as skills (o nome e o id já contam).
const SINONIMOS_SKILL: Record<string, string[]> = {
  'spring-boot': ['spring', 'springboot'],
  'spring-data-jpa': ['jpa', 'spring data'],
  'spring-mvc': ['mvc'],
  postgresql: ['postgres', 'postgre'],
  javascript: ['js'],
  typescript: ['ts'],
  vuejs: ['vue'],
  kafka: ['kafka', 'mensageria'],
  'angular-material': ['material'],
  'github-actions': ['actions'],
  'ci-cd': ['ci', 'cd', 'cicd', 'pipeline', 'pipelines'],
  'groovy-grails': ['groovy', 'grails'],
  'ia-llms': ['ia', 'ai', 'llm', 'llms', 'inteligencia artificial', 'gemini', 'chatgpt'],
  'agentes-ia': ['agentes', 'agente'],
  'github-copilot': ['copilot'],
  'clean-architecture': ['arquitetura limpa'],
  microservicos: ['microservico', 'microsservicos', 'microsservico', 'microservices'],
  testes: ['teste', 'testes', 'testes unitarios', 'testes de integracao', 'junit', 'tdd'],
  'design-system': ['design systems'],
  sql: ['banco de dados relacional'],
};

const SINONIMOS_PROJETO: Record<string, string[]> = {
  'assistente-pedidos-ia': ['assistente de pedidos', 'pedidos'],
  'portfolio-3d': ['portfolio 3d', 'este site', 'esse site', 'este portfolio'],
  'nfe-estudo': ['nfe', 'nf e', 'nota fiscal', 'nota fiscal eletronica'],
  linketinder: ['linketinder', 'linke tinder'],
  'todo-list': ['todo', 'todolist', 'to do', 'lista de tarefas', 'tarefas'],
  conversor: ['conversor'],
};

const AREAS: [Area, string[]][] = [
  ['livraria', ['livraria', 'estante', 'livros']],
  ['floricultura', ['floricultura', 'vasos', 'flores', 'plantas']],
  ['cafe', ['cafe', 'mesa', 'balcao']],
  ['entrada', ['entrada', 'porta', 'rua', 'inicio']],
];

const GATILHOS = {
  saudacao: [
    'oi',
    'ola',
    'bom dia',
    'boa tarde',
    'boa noite',
    'hey',
    'eai',
    'e ai',
    'opa',
    'salve',
  ],
  agradecimento: ['obrigado', 'obrigada', 'valeu', 'brigado', 'brigada', 'agradeco'],
  navegar: [
    'leva',
    'levar',
    'leve',
    'ir para',
    'ir pra',
    'ir a',
    'vamos',
    'mostra a',
    'mostre a',
    'abre a',
    'quero ir',
    'me leva',
  ],
  projetos: ['projeto', 'projetos', 'trabalhos', 'portfolio de projetos', 'aplicacoes', 'sistemas'],
  sabe: [
    'sabe',
    'conhece',
    'domina',
    'trabalha com',
    'usa',
    'utiliza',
    'experiencia com',
    'mexe com',
    'programa em',
  ],
  skills: [
    'skills',
    'skill',
    'tecnologias',
    'tecnologia',
    'stack',
    'habilidades',
    'ferramentas',
    'linguagens',
    'competencias',
  ],
  experiencia: [
    'experiencia',
    'trabalha',
    'trabalhou',
    'empresa',
    'emprego',
    'cargo',
    'zg',
    'carreira',
    'trajetoria',
    'atua',
    'atuacao',
    'one',
    'alura',
    'oracle',
  ],
  formacao: [
    'formacao',
    'faculdade',
    'graduacao',
    'curso',
    'estudou',
    'estuda',
    'universidade',
    'acelerar',
    'capacitacao',
  ],
  contato: [
    'contato',
    'linkedin',
    'github',
    'email',
    'e mail',
    'curriculo',
    'cv',
    'contratar',
    'entrevista',
    'falar com ela',
  ],
  sobre: [
    'quem e',
    'quem eh',
    'sobre ela',
    'sobre a adrielly',
    'apresenta',
    'resumo',
    'adrielly',
    'perfil',
  ],
  ajuda: [
    'ajuda',
    'o que voce faz',
    'o que voce sabe',
    'pode fazer',
    'como funciona',
    'quem e voce',
    'o que posso perguntar',
  ],
};

/** minúsculas, sem acentos, sem pontuação, espaços simples. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const contem = (texto: string, termo: string) => ` ${texto} `.includes(` ${termo} `);
const algum = (texto: string, termos: readonly string[]) => termos.some((t) => contem(texto, t));

/**
 * Encontra ids citados no texto. Testa os apelidos mais longos primeiro e "consome"
 * o trecho encontrado, para "spring data" não contar também como "spring".
 */
function encontrar(texto: string, apelidos: Map<string, string>): string[] {
  let resto = ` ${texto} `;
  const achados: string[] = [];
  for (const [apelido, id] of [...apelidos].sort((a, b) => b[0].length - a[0].length)) {
    if (resto.includes(` ${apelido} `)) {
      resto = resto.replace(` ${apelido} `, ' · ');
      if (!achados.includes(id)) achados.push(id);
    }
  }
  return achados;
}

/** nome, id e sinônimos de cada item → id. */
function apelidos(
  itens: readonly { id: string; nome: string }[],
  sinonimos: Record<string, string[]>,
): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const item of itens) {
    [normalizar(item.nome), normalizar(item.id), ...(sinonimos[item.id] ?? [])].forEach((a) =>
      mapa.set(a, item.id),
    );
  }
  return mapa;
}

function lista(itens: string[]): string {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;
}

// ---------------------------------------------------------------------------
// Regras: cada intenção é uma regra; a primeira que se aplica responde.
// A ordem importa (ex.: "trabalha com Java" é sobre tecnologia, não experiência).
// ---------------------------------------------------------------------------

/** A pergunta já analisada, mais os dados. É o que cada regra recebe. */
interface Contexto {
  texto: string;
  dados: DadosAurora;
  nome: string;
  skill?: Skill;
  projeto?: Projeto;
  area?: Area;
}

interface Regra {
  aplica(c: Contexto): boolean;
  responde(c: Contexto): RespostaChat;
}

const gatilho =
  (chave: keyof typeof GATILHOS) =>
  (c: Contexto): boolean =>
    algum(c.texto, GATILHOS[chave]);

function analisar(pergunta: string, dados: DadosAurora): Contexto {
  const texto = normalizar(pergunta);
  const [idSkill] = encontrar(texto, apelidos(dados.skills, SINONIMOS_SKILL));
  const [idProjeto] = encontrar(texto, apelidos(dados.projetos, SINONIMOS_PROJETO));
  return {
    texto,
    dados,
    nome: dados.perfil.nome.split(' ')[0],
    skill: dados.skills.find((s) => s.id === idSkill),
    projeto: dados.projetos.find((p) => p.id === idProjeto),
    area: AREAS.find(([, termos]) => algum(texto, termos))?.[0],
  };
}

const NOMES_AREA: Record<Area, string> = {
  livraria: 'livraria, onde ficam os projetos',
  floricultura: 'floricultura, onde ficam as skills',
  cafe: 'café',
  entrada: 'entrada',
  aurora: 'balcão',
};

function ajuda({ nome }: Contexto): RespostaChat {
  return {
    mensagem: `Eu sou a Aurora, guia deste café. Pergunte sobre os projetos, as tecnologias ou a experiência da ${nome}, e eu te levo até lá.`,
    acoes: [],
    sugestoes: SUGESTOES_INICIAIS,
  };
}

function navegar({ area }: Contexto): RespostaChat {
  const destino = area ?? 'entrada';
  return {
    mensagem: `Claro! Vamos até a ${NOMES_AREA[destino]}.`,
    acoes: [{ tipo: 'NAVEGAR', destino }],
  };
}

function falarDoProjeto({ projeto }: Contexto): RespostaChat {
  if (!projeto) return NAO_SEI;
  return {
    mensagem: `${projeto.nome}: ${projeto.descricaoCurta} Abri os detalhes pra você.`,
    acoes: [
      { tipo: 'NAVEGAR', destino: 'livraria' },
      { tipo: 'ABRIR_PROJETO', projetoId: projeto.id },
    ],
    sugestoes: ['Quais outros projetos ela tem?', 'Quais tecnologias ela usa?'],
  };
}

/** "projetos com Java", "ela sabe Redis?": cita os projetos e onde usa no trabalho. */
function falarDaSkill({ skill, dados, texto, nome }: Contexto): RespostaChat {
  if (!skill) return NAO_SEI;
  const comSkill = dados.projetos.filter((p) => p.tecnologias.includes(skill.id));
  const empresas = dados.perfil.experiencias
    .filter((e) => e.tecnologias.includes(skill.id))
    .map((e) => e.empresa);
  const noTrabalho = empresas.length ? ` Usa no trabalho (${lista(empresas)}).` : '';

  if (!comSkill.length) {
    const semProjeto = noTrabalho || ' Ainda não há projeto com ela na estante.';
    return {
      mensagem: `Sim, ${skill.nome} faz parte das skills da ${nome}.${semProjeto} Destaquei na floricultura.`,
      acoes: [
        { tipo: 'NAVEGAR', destino: 'floricultura' },
        { tipo: 'DESTACAR_PROJETOS', tecnologia: skill.id },
      ],
      sugestoes: ['Quais projetos ela tem?', 'Quais tecnologias ela usa?'],
    };
  }

  const nomes = lista(comSkill.map((p) => p.nome));
  const quantos =
    comSkill.length === 1 ? 'Este projeto usa' : `Estes ${comSkill.length} projetos usam`;
  const intro = algum(texto, GATILHOS.projetos)
    ? `${quantos} ${skill.nome}: ${nomes}.`
    : `Sim! ${skill.nome} faz parte das skills da ${nome}. Aparece em ${nomes}.`;
  return {
    mensagem: `${intro}${noTrabalho} Separei na estante pra você.`,
    acoes: [
      { tipo: 'NAVEGAR', destino: 'livraria' },
      { tipo: 'DESTACAR_PROJETOS', tecnologia: skill.id },
    ],
    sugestoes: ['Quais tecnologias ela usa?', 'Onde ela trabalha?'],
  };
}

function tecnologiaDesconhecida({ nome }: Contexto): RespostaChat {
  return {
    mensagem: `Não encontrei essa tecnologia nas skills da ${nome}. Na floricultura estão todas as que ela usa.`,
    acoes: [{ tipo: 'NAVEGAR', destino: 'floricultura' }, { tipo: 'LIMPAR_DESTAQUE' }],
    sugestoes: ['Quais tecnologias ela usa?', 'Quais projetos usam Java?'],
  };
}

function agradecimento(): RespostaChat {
  return {
    mensagem: 'Por nada! Se quiser saber mais alguma coisa, é só perguntar.',
    acoes: [],
    sugestoes: SUGESTOES_INICIAIS,
  };
}

function contato({ dados, nome }: Contexto): RespostaChat {
  const { links, curriculoUrl } = dados.perfil;
  const email = links.find((l) => l.tipo === 'EMAIL');
  const canais: string[] = [];
  if (links.some((l) => l.tipo === 'LINKEDIN')) canais.push('LinkedIn');
  if (email) canais.push(`e-mail (${email.rotulo})`);
  const curriculo = curriculoUrl ? ' O currículo em PDF também está lá.' : '';
  return {
    mensagem: `Você pode falar com a ${nome} pelo ${lista(canais)}.${curriculo} Separei os contatos pra você.`,
    acoes: [{ tipo: 'ABRIR_PAINEL', painel: 'contato' }],
  };
}

function formacao({ dados }: Contexto): RespostaChat {
  const formacoes = dados.perfil.formacoes.map((f) => `${f.curso} (${f.instituicao})`);
  return {
    mensagem: `Formação: ${lista(formacoes)}. Separei a trajetória completa.`,
    acoes: [{ tipo: 'ABRIR_PAINEL', painel: 'trajetoria' }],
    sugestoes: ['Onde ela trabalha?', 'Quais tecnologias ela usa?'],
  };
}

function experiencia({ dados, nome }: Contexto): RespostaChat {
  const [atual, ...anteriores] = dados.perfil.experiencias;
  let mensagem = 'A trajetória profissional ainda não foi cadastrada.';
  if (atual) {
    const desde = atual.fim ? '' : ` (desde ${atual.inicio.slice(0, 4)})`;
    const cargosAnteriores = anteriores.map((e) => `${e.cargo} em ${e.empresa}`);
    const antes = anteriores.length ? ` Antes: ${lista(cargosAnteriores)}.` : '';
    mensagem = `Hoje a ${nome} é ${atual.cargo} na ${atual.empresa}${desde}: ${atual.descricao}${antes} Separei a trajetória completa.`;
  }
  return {
    mensagem,
    acoes: [{ tipo: 'ABRIR_PAINEL', painel: 'trajetoria' }],
    sugestoes: ['Quais tecnologias ela usa?', 'Quais projetos ela tem?'],
  };
}

function resumoSkills({ dados }: Contexto): RespostaChat {
  const { skills } = dados;
  const destaques = skills.filter((s) => s.destaque).map((s) => s.nome);
  const categorias = CATEGORIAS_SKILL.filter((c) => skills.some((s) => s.categoria === c.id)).map(
    (c) => c.rotulo.toLowerCase(),
  );
  return {
    mensagem: `As principais são ${lista(destaques)}. Ao todo são ${skills.length} skills, entre ${lista(categorias)}. Te levei à floricultura.`,
    acoes: [{ tipo: 'NAVEGAR', destino: 'floricultura' }, { tipo: 'LIMPAR_DESTAQUE' }],
    sugestoes: ['Quais projetos usam Kafka?', 'Ela trabalha com IA?'],
  };
}

function resumoProjetos({ dados }: Contexto): RespostaChat {
  const destaques = dados.projetos.filter((p) => p.destaque).map((p) => p.nome);
  return {
    mensagem: `São ${dados.projetos.length} projetos na estante. Os destaques: ${lista(destaques)}. Toque num livro para ver os detalhes.`,
    acoes: [{ tipo: 'NAVEGAR', destino: 'livraria' }, { tipo: 'LIMPAR_DESTAQUE' }],
    sugestoes: ['Me fala do Assistente de Pedidos', 'Quais projetos usam Java?'],
  };
}

function apresentacao({ dados }: Contexto): RespostaChat {
  const { nome, titulo, localizacao } = dados.perfil;
  const de = localizacao ? `, de ${localizacao}` : '';
  return {
    mensagem: `${nome} é ${titulo}${de}. Separei a apresentação dela.`,
    acoes: [{ tipo: 'ABRIR_PAINEL', painel: 'apresentacao' }],
    sugestoes: ['Onde ela trabalha?', 'Quais projetos ela tem?'],
  };
}

function saudacao({ nome }: Contexto): RespostaChat {
  return {
    mensagem: `Olá! Eu sou a Aurora. Posso te mostrar os projetos, as skills e a trajetória da ${nome}.`,
    acoes: [],
    sugestoes: SUGESTOES_INICIAIS,
  };
}

/** Área citada sem verbo de navegação: "e a floricultura?". */
function irParaArea({ area }: Contexto): RespostaChat {
  return { mensagem: 'Vamos lá!', acoes: [{ tipo: 'NAVEGAR', destino: area ?? 'entrada' }] };
}

/** Quando nada se aplica: não inventa, diz que não sabe e sugere perguntas. */
const NAO_SEI: RespostaChat = {
  mensagem:
    'Essa informação não está no portfólio, e eu só respondo com o que está aqui. Posso ajudar com projetos, skills, experiência ou contato.',
  acoes: [],
  sugestoes: SUGESTOES_INICIAIS.slice(0, 3),
};

const REGRAS: Regra[] = [
  { aplica: (c) => !c.texto, responde: ajuda },
  { aplica: (c) => !!c.area && gatilho('navegar')(c), responde: navegar },
  { aplica: (c) => !!c.projeto, responde: falarDoProjeto },
  { aplica: (c) => !!c.skill, responde: falarDaSkill },
  { aplica: gatilho('sabe'), responde: tecnologiaDesconhecida },
  { aplica: gatilho('agradecimento'), responde: agradecimento },
  { aplica: gatilho('contato'), responde: contato },
  { aplica: gatilho('formacao'), responde: formacao },
  { aplica: gatilho('experiencia'), responde: experiencia },
  { aplica: gatilho('skills'), responde: resumoSkills },
  { aplica: gatilho('projetos'), responde: resumoProjetos },
  { aplica: gatilho('ajuda'), responde: ajuda },
  { aplica: gatilho('sobre'), responde: apresentacao },
  { aplica: gatilho('saudacao'), responde: saudacao },
  { aplica: (c) => !!c.area, responde: irParaArea },
];

export function responderLocalmente(pergunta: string, dados: DadosAurora): RespostaChat {
  const contexto = analisar(pergunta, dados);
  return REGRAS.find((regra) => regra.aplica(contexto))?.responde(contexto) ?? NAO_SEI;
}
