import type { Projeto } from '../../models';

// Fonte: repositórios públicos em github.com/AdriellyVitoria (README e linguagens de cada um).
// Os textos resumem o que está nos READMEs; revisar antes de considerar final.
const GITHUB = 'https://github.com/AdriellyVitoria';

export const PROJETOS: readonly Projeto[] = [
  {
    id: 'assistente-pedidos-ia',
    nome: 'Assistente de Pedidos com IA',
    descricaoCurta:
      'Chat em que o cliente conversa com uma IA sobre os próprios pedidos, com respostas baseadas só em dados reais do banco.',
    problema:
      'Integrar um LLM a dados sensíveis com segurança: a IA nunca escreve SQL nem acessa o banco; ela só pede ao backend funções pré-definidas, e o backend usa o usuário do token JWT para decidir o que ela pode ver.',
    funcionalidades: [
      'Login com JWT e contas de demonstração',
      'Chat com IA via function calling (Gemini), com perguntas de continuação e datas relativas',
      'Painel "Meus pedidos" ao lado do chat para comparar com as respostas da IA',
      'Limite de perguntas por usuário e mensagens amigáveis quando a IA está indisponível',
      'Auditoria de todas as perguntas e respostas',
      'Testes com JUnit 5, Mockito, Testcontainers e Vitest, com CI no GitHub Actions',
    ],
    tecnologias: [
      'java',
      'spring-boot',
      'spring-data-jpa',
      'postgresql',
      'angular',
      'angular-material',
      'typescript',
      'ia-llms',
      'docker',
      'testes',
      'github-actions',
    ],
    githubUrl: `${GITHUB}/pedidos-assistente`,
    demoUrl: 'https://pedidos-assistenteapp.vercel.app',
    destaque: true,
    ordem: 1,
    corCapa: 'terracota',
  },
  {
    id: 'portfolio-3d',
    nome: 'Portfólio 3D',
    descricaoCurta:
      'Este portfólio: um café, livraria e floricultura de outono em 3D, com versão 2D acessível.',
    problema:
      'Apresentar trajetória, projetos e skills de forma memorável sem perder acessibilidade, SEO e desempenho em celulares.',
    funcionalidades: [
      'Cena 3D em Three.js com estações, câmera guiada e cliques nos objetos',
      'Skills ligadas aos projetos: escolher uma skill destaca os livros na estante',
      'Versão simples pré-renderizada, navegável por teclado',
      'Dados atrás de repositories, prontos para trocar por uma API',
    ],
    tecnologias: [
      'angular',
      'typescript',
      'scss',
      'html',
      'ux-ui',
      'testes',
      'github-actions',
      'git',
    ],
    githubUrl: `${GITHUB}/portfolio`,
    destaque: true,
    ordem: 2,
    corCapa: 'verde',
  },
  {
    id: 'nfe-estudo',
    nome: 'NF-e Estudo',
    descricaoCurta:
      'Emissor simplificado de Nota Fiscal Eletrônica, com SEFAZ simulado, fila e eventos em Kafka.',
    problema:
      'Praticar, num fluxo realista de emissão de NF-e, a integração entre serviços com REST, SOAP, filas JMS, Kafka, cache e autenticação.',
    funcionalidades: [
      'Criação e emissão de notas com XML validado em XSD e envio via SOAP',
      'SEFAZ simulado no WildFly processando pela fila JMS',
      'Evento de nota autorizada publicado no Kafka (padrão outbox) e auditoria',
      'Consulta de status com cache no Infinispan',
      'API protegida por JWT do Keycloak, com papéis de emissor e consulta',
      'Interface em Vue.js e ambiente completo com Docker Compose',
    ],
    tecnologias: ['java', 'quarkus', 'kafka', 'postgresql', 'vuejs', 'apis-rest', 'docker'],
    githubUrl: `${GITHUB}/nota-fiscal`,
    destaque: true,
    ordem: 3,
    corCapa: 'amarelo',
  },
  {
    id: 'linketinder',
    nome: 'Linketinder',
    descricaoCurta:
      'Rede que liga empresas e candidatos de forma anônima até haver match. Feito no programa Acelerar ZG.',
    problema:
      'Unir o match do Tinder às competências do LinkedIn na relação entre empresa recrutadora e candidato.',
    funcionalidades: [
      'Login como empresa ou candidato',
      'Candidato: listar vagas, ver vagas aplicadas e editar perfil',
      'Empresa: gerenciar vagas e perfil',
    ],
    tecnologias: ['groovy-grails', 'typescript'],
    githubUrl: `${GITHUB}/linketinder_groovy`,
    destaque: false,
    ordem: 4,
    corCapa: 'lilas',
  },
  {
    id: 'todo-list',
    nome: 'TodoList',
    descricaoCurta: 'Aplicação de lista de tarefas em Java, feita no programa Acelerar ZG.',
    problema: 'Organizar tarefas por prioridade, categoria e status.',
    funcionalidades: [
      'Criar, atualizar e deletar tarefas',
      'Listar por prioridade, categoria e status',
      'Consultar o número de tarefas',
    ],
    tecnologias: ['java', 'javascript', 'html', 'css'],
    githubUrl: `${GITHUB}/TodoList_K1-t2`,
    demoUrl: 'https://todo-list-k1-t2.vercel.app',
    destaque: false,
    ordem: 5,
    corCapa: 'laranja',
  },
  {
    id: 'conversor',
    nome: 'Conversor',
    descricaoCurta:
      'Desafio do programa ONE (Oracle + Alura): conversor em Java com interface Swing.',
    problema: 'Converter moedas, temperaturas e distâncias, nos dois sentidos.',
    funcionalidades: [
      'Moedas (ex.: real para dólar e euro)',
      'Temperatura (Celsius, Fahrenheit e Kelvin)',
      'Distância (quilômetros, metros e centímetros)',
    ],
    tecnologias: ['java'],
    githubUrl: `${GITHUB}/conversor`,
    destaque: false,
    ordem: 6,
    corCapa: 'rosa',
  },
];
