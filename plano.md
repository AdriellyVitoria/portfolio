# Plano — Portfólio 3D "Café, Livraria e Floricultura de Outono"

> Foco desta etapa: **frontend**. O backend entra depois, sem retrabalho no front.
> Baseado no [context (2).md](context%20(2).md).

## Premissas (respostas suas)

| Pergunta | Resposta | Impacto no plano |
|---|---|---|
| Experiência com Three.js / Blender | Nenhuma nos dois | Fase dedicada de aprendizado; assets **CC0 adaptados** em vez de modelar do zero; cena primeiro em "grey-box" (cubos) |
| Tempo por semana | 20h+ | Fases de 1–3 semanas cada; dá para estudar e construir em paralelo |
| Prazo | Sem prazo fixo | Marcos por **critério de pronto**, não por data. Estimativas são só referência |
| Estratégia de MVP | Modo simples primeiro | `/simples` vai ao ar cedo e já serve a recrutadores enquanto o 3D é construído |

---

## 1. Fases do frontend

Visão geral (estimativas em semanas com ~20h/semana):

| # | Fase | Estimativa | Entrega visível |
|---|---|---|---|
| 0 | Fundação do projeto ✅ | 0,5–1 | Repo, CI e deploy de um "hello" |
| 1 | Contratos, dados mock e estado | 1 | Camada de dados testada, sem UI |
| 2 | Modo simples (`/simples`) — **MVP público** | 2–3 | Portfólio 2D completo no ar |
| 3 | Aurora (chat) com mock | 1–2 | Chat funcionando no modo simples |
| 4 | Aprendizado 3D (Three.js + Blender) | 2–3 | Sandboxes descartáveis |
| 5 | Motor da cena em grey-box | 2–3 | Cena navegável com cubos, cliques ligados ao estado |
| 6 | Assets 3D e montagem do ambiente | 3–5 | Ambiente real com modelos e luz bakeada |
| 7 | Atmosfera e experiência | 2 | Folhas, animações, tela de carregamento, música |
| 8 | Mobile, performance e fallback | 1–2 | Níveis de qualidade, fallback automático |
| 9 | Polimento, acessibilidade, testes e lançamento | 1–2 | Versão 3D pública |

---

### Fase 0 — Fundação do projeto ✅

> **Concluída (2026-10-01).** Angular 22.2 zoneless, SSG (`outputMode: static`), Vitest, ESLint com fronteiras entre camadas, Prettier, tokens SCSS e CI no GitHub Actions. Falta conectar o repositório ao GitHub e à Vercel/Netlify.

**Objetivo:** ter um esqueleto profissional antes de escrever qualquer funcionalidade.

**Tarefas**
- Criar o projeto com a versão estável mais recente do Angular CLI (standalone, signals, SCSS, roteamento).
- Verificar se o projeto foi gerado **zoneless** (padrão nas versões recentes) — ver nota em [§4](#4-arquitetura-da-cena-3d).
- ESLint + Prettier + `strict` no TypeScript.
- Estrutura de pastas vazia (`core/`, `scene/`, `features/`, `shared/`) — ver [§2](#2-estrutura-de-pastas).
- Design tokens SCSS da paleta de outono (`_tokens.scss`): cores, tipografia, espaçamentos, raios, sombras, durações de animação.
- Escolher tipografia (uma serifada elegante para títulos + uma sans legível para texto).
- Repositório no GitHub, README inicial, convenção de commits (Conventional Commits).
- GitHub Actions: lint + testes + build a cada PR.
- Deploy contínuo (Vercel/Netlify/Firebase) da branch `main`.

**Pronto quando:** um push na `main` gera build verde e publica uma página com os tokens aplicados.

**Demonstra:** organização, CI/CD, padronização de código.

---

### Fase 1 — Contratos, dados mock e estado

**Objetivo:** criar o "coração" da aplicação: os dados e o estado. A UI 2D, a cena 3D e a Aurora não terão cópias próprias disso; as três vão ler e alterar **a mesma instância** desses serviços (singletons via `providedIn: 'root'`). Se uma muda o estado, as outras reagem.

**Tarefas**
- Interfaces em `core/models/` (ver [§3](#3-modelagem-das-interfaces-typescript)).
- Repositories abstratos: `ProjetoRepository`, `SkillRepository`, `PerfilRepository`, `ChatRepository`.
- Implementações mock lendo JSON em `public/mock/` (com atraso simulado opcional, para testar estados de carregamento).
- Providers em `app.config.ts` com uma função `provideDados('mock' | 'http')` lendo de `environment`.
- `PortfolioStateService` com signals (ver [§4.6](#46-a-ponte-portfoliostateservice)).
- Dados de exemplo **marcados como placeholder** (`"placeholder": true` e nomes como "Projeto Exemplo 1").
- Testes unitários dos repositories mock e do estado.

**Pronto quando:** os testes provam que filtrar projetos por tecnologia, selecionar projeto e trocar de área funcionam, sem nenhuma UI.

**Demonstra:** Repository + injeção de dependência, signals, contratos tipados, testes.

---

### Fase 2 — Modo simples (`/simples`) — MVP público

**Objetivo:** um portfólio 2D completo, rápido e acessível, usando o mesmo estado e os mesmos dados.

**Tarefas**
- Componentes em `shared/`: `Painel`, `Botao`, `Tag`, `CardProjeto`, `IconeLink`.
- Seções: Apresentação, Projetos (com filtro por tecnologia), Skills (agrupadas por categoria), Experiência, Formação, Contato (LinkedIn/GitHub), botão de download do currículo.
- Clicar em uma skill filtra/destaca os projetos — **o mesmo** `filtroTecnologia` que a cena vai usar.
- Rota `/projetos/:id` (ou painel com deep link) para compartilhar um projeto específico.
- SEO: `<title>`, meta description, Open Graph, `sitemap.xml`; **prerender (SSG)** da rota `/simples`.
- Acessibilidade: HTML semântico, foco visível, navegação por teclado, contraste AA com a paleta, `prefers-reduced-motion`.
- Responsivo mobile-first.
- Rota padrão `/` aponta temporariamente para `/simples` até o 3D ficar pronto.

**Pronto quando:** está publicado, Lighthouse ≥ 90 em todas as categorias e funciona só com teclado.

**Demonstra:** Angular moderno, UX/UI, acessibilidade, SEO, design system próprio.

---

### Fase 3 — Aurora (chat) com mock

**Objetivo:** a interface completa do chat e o **executor de ações**, já funcionando no modo simples.

**Tarefas**
- Componente `aurora-chat` (botão flutuante + painel): lista de mensagens, input, indicador "digitando…", sugestões rápidas ("Projetos com Java", "Me fale da sua experiência").
- `ChatMockRepository`: respostas pré-definidas por palavra-chave/intenção, seguindo o contrato `RespostaChat`.
- `AcaoExecutorService`: recebe `Acao[]` e traduz cada uma em chamadas ao `PortfolioStateService`.
- No modo simples, `NAVEGAR` rola até a seção; no 3D (fase 5+), move a câmera. **Mesmo executor, mesmo estado.**
- Resposta padrão "essa informação não está disponível no portfólio" para perguntas desconhecidas.
- Acessibilidade: `aria-live` nas mensagens novas, foco gerenciado ao abrir e fechar.

**Pronto quando:** "quero ver projetos com Java" rola até os projetos e filtra Java no `/simples`.

**Demonstra:** design orientado a contrato, padrão Command (ações), preparação para IA.

---

### Fase 4 — Aprendizado 3D (Three.js + Blender)

**Objetivo:** adquirir a base mínima antes de construir o motor real. Os sandboxes são **descartáveis** (repo ou pasta separada).

**Three.js — exercícios em ordem**
1. Cena, câmera, renderer, render loop e resize.
2. Geometrias, materiais (`MeshStandardMaterial`), luzes, sombras.
3. `OrbitControls` e depois controle de câmera manual (lerp de posição e alvo).
4. Raycasting: clicar em um cubo e mudar a cor.
5. Carregar GLB com `GLTFLoader` + `DRACOLoader`; ver a hierarquia com `scene.traverse`.
6. `InstancedMesh` com 500 folhas caindo.
7. Texturas, `colorSpace`, tone mapping; textura de lightmap.
8. Medir performance: `renderer.info`, `stats.js`, Spector.js.

**Blender — o essencial para este projeto**
1. Interface, navegação, modo objeto/edição.
2. Importar assets CC0, juntar, escalar, posicionar e trocar materiais/cores.
3. Nomear objetos de forma consistente (o código vai usar os nomes).
4. Exportar glTF/GLB com compressão Draco.
5. Bake de iluminação para textura (lightmap) — o passo mais difícil, deixe por último.

**Materiais sugeridos:** documentação e exemplos oficiais do Three.js; *Discover three.js* (livro online gratuito); *Three.js Journey* (pago, muito completo); um curso introdutório de Blender (ex.: a série do donut do Blender Guru).

**Pronto quando:** você consegue, sem tutorial aberto, carregar um GLB feito por você e clicar em um objeto dele.

**Demonstra:** (indireto) capacidade de aprender uma área nova. Vale contar isso na entrevista.

---

### Fase 5 — Motor da cena em grey-box

**Objetivo:** toda a **arquitetura** 3D funcionando com cubos e planos no lugar dos modelos. Arte vem depois.

**Tarefas**
- `SceneEngineService`: renderer, loop, resize, pausa quando a aba fica oculta, `dispose`.
- `CameraDirector`: estações (porta, livraria, floricultura, café, Aurora) e transições suaves.
- `Interaction`: raycasting de clique/toque e hover (cursor pointer).
- Áreas como classes TS puras: `LivrariaArea` (caixas = livros), `FloriculturaArea` (cilindros = vasos), `CafeArea` (caixas = notebook, cardápio, pasta).
- Ponte com o estado via `effect()` (ver [§4.6](#46-a-ponte-portfoliostateservice)).
- Componente `cena-3d` (host do canvas) + painéis HTML das features sobrepostos.
- HUD: menu de estações, botão "voltar", link para `/simples`, botão de música (inativo por enquanto).
- Executor da Aurora passa a mover a câmera.

**Pronto quando:** clicar em um "livro-cubo" abre o painel do projeto; clicar em "Java" na floricultura destaca os livros certos; a Aurora leva a câmera até a livraria — tudo com cubos.

**Demonstra:** domínio do render loop, separação Angular × Three.js, comunicação por estado reativo.

---

### Fase 6 — Assets 3D e montagem do ambiente

**Objetivo:** trocar o grey-box pelo ambiente real, sem mudar a arquitetura.

**Tarefas**
- Coletar assets CC0 (ver [§5](#5-estratégia-de-assets-3d)) e montar a cena no Blender usando a ilustração conceitual como referência.
- Ajustar materiais para a paleta de outono (cores sólidas / texturas pequenas).
- Convenção de nomes para objetos interativos (ex.: `livro__<idProjeto>`, `vaso__<idSkill>`, `cafe__notebook`).
- Livros **gerados por código** a partir dos dados (geometria simples + cor por projeto), não modelados um a um: novos projetos aparecem sem abrir o Blender.
- Plaquinhas dos vasos com texto via `CanvasTexture` gerada dos dados.
- Prateleira de destaque iluminada para projetos com Java, Spring Boot, Angular, PostgreSQL e IA.
- Bake da iluminação estática; luzes dinâmicas mínimas (uma direcional/ambiente + destaques).
- Exportar em GLB com Draco; texturas em KTX2 se o peso pedir.
- Divisão em arquivos por área para carregamento progressivo.

**Pronto quando:** o ambiente lembra a ilustração conceitual, roda a 60 fps no desktop médio e o GLB inicial respeita o orçamento de [§6](#6-estratégia-mobile-e-performance).

**Demonstra:** pipeline de assets 3D, otimização, geração procedural a partir de dados.

---

### Fase 7 — Atmosfera e experiência

**Tarefas**
- Folhas caindo com `InstancedMesh` (vento simples com seno/ruído; quantidade por nível de qualidade).
- Animações sutis: vapor da xícara, luminária oscilando, páginas, plantas balançando (shader de vértice simples).
- Aurora na cena (ver risco em [§8](#8-riscos-e-pontos-de-atenção)) com idle sutil.
- Tela de carregamento temática ("preparando o café…") ligada ao progresso real do `LoadingManager`.
- Entrada pela porta: animação de abertura (pulada em `prefers-reduced-motion`).
- Música ambiente opcional, **desligada por padrão**, com botão e preferência salva.
- Microinterações de hover nos objetos clicáveis (brilho/contorno).

**Pronto quando:** com `prefers-reduced-motion` ativo, todas as animações não essenciais param e as transições de câmera viram cortes/fades.

**Demonstra:** cuidado com UX e com detalhes, acessibilidade de movimento.

---

### Fase 8 — Mobile, performance e fallback

**Tarefas**
- Níveis de qualidade (`alta`, `media`, `baixa`) definidos por detecção inicial + medição de FPS nos primeiros segundos.
- Limite de pixel ratio, sombras desligadas no nível baixo, menos folhas, sem pós-processamento.
- Fallback automático para `/simples` sem WebGL2 ou com FPS muito baixo (com aviso e opção de tentar o 3D).
- Gestos: toque para selecionar, arrastar para rotação limitada, sem conflito com o scroll dos painéis.
- Painéis em formato "bottom sheet" no celular.
- Testes em celulares reais (um Android intermediário é a referência mais honesta).

**Pronto quando:** Android intermediário mantém ~30+ fps estáveis no nível médio e o carregamento inicial em 4G fica dentro do orçamento.

**Demonstra:** performance web, renderização adaptativa, pensamento mobile.

---

### Fase 9 — Polimento, acessibilidade, testes e lançamento

**Tarefas**
- Navegação por teclado também no 3D: menu de estações e lista de objetos focáveis espelhando o que é clicável na cena.
- Testes: unitários (estado, executor, repositories, áreas com mocks do Three), E2E com Playwright (fluxos principais no `/simples` e smoke test do 3D).
- Revisão de textos e conteúdo real (projetos, experiência, currículo) — **depende de você**.
- Analytics simples e respeitoso de privacidade (opcional).
- `/` passa a abrir o 3D; `/simples` continua com link visível.
- README com arquitetura, decisões e GIF da experiência.

**Pronto quando:** não há placeholder visível, os testes passam no CI e o 3D está público.

---

## 2. Estrutura de pastas

```
src/
├── app/
│   ├── app.config.ts            → providers globais; ÚNICO lugar onde mock ↔ http é trocado
│   ├── app.routes.ts            → '/', '/simples', '/projetos/:id'
│   │
│   ├── core/
│   │   ├── models/
│   │   │   ├── projeto.model.ts
│   │   │   ├── skill.model.ts
│   │   │   ├── perfil.model.ts      → Perfil, Experiencia, Formacao, Link
│   │   │   ├── chat.model.ts        → MensagemChat, RespostaChat, Acao
│   │   │   └── area.model.ts        → type Area
│   │   ├── data/
│   │   │   ├── projeto.repository.ts        → classe abstrata
│   │   │   ├── skill.repository.ts
│   │   │   ├── perfil.repository.ts
│   │   │   ├── chat.repository.ts
│   │   │   ├── mock/                        → implementações mock (leem public/mock/*.json)
│   │   │   ├── http/                        → implementações HTTP (fase de backend)
│   │   │   └── provide-dados.ts             → provideDados('mock' | 'http')
│   │   ├── state/
│   │   │   └── portfolio-state.service.ts   → signals: área, projeto selecionado, filtro, destaque
│   │   ├── aurora/
│   │   │   └── acao-executor.service.ts     → Acao[] → chamadas ao estado
│   │   └── preferencias/
│   │       └── preferencias.service.ts      → música, qualidade, reduced-motion (localStorage com try/catch)
│   │
│   ├── scene/                     → sem imports de componentes Angular
│   │   ├── scene-engine.service.ts    → renderer, loop, resize, visibilidade, dispose
│   │   ├── scene-bridge.service.ts    → effects: estado → cena; callbacks: cena → estado
│   │   ├── camera-director.ts         → estações e transições
│   │   ├── estacoes.ts                → configuração das estações (posição, alvo, limites de rotação)
│   │   ├── interaction.ts             → raycasting, hover, clique/toque
│   │   ├── asset-loader.ts            → GLTF + Draco (+ KTX2), progresso
│   │   ├── qualidade.ts               → níveis de qualidade e detecção
│   │   └── areas/
│   │       ├── area.ts                → interface comum (init, update(dt), dispose)
│   │       ├── livraria.area.ts       → livros gerados a partir dos projetos, destaque
│   │       ├── floricultura.area.ts   → vasos e plaquinhas a partir das skills
│   │       ├── cafe.area.ts           → notebook, cardápio, pasta
│   │       ├── aurora.area.ts         → personagem e idle
│   │       └── folhas.ts              → InstancedMesh de folhas
│   │
│   ├── features/
│   │   ├── experiencia-3d/        → página '/': host do canvas + HUD + painéis
│   │   ├── livraria/              → painel de projeto
│   │   ├── floricultura/          → painel de skill (projetos relacionados)
│   │   ├── cafe/                  → painéis de apresentação, trajetória, currículo
│   │   ├── aurora-chat/           → UI do chat
│   │   ├── carregamento/          → tela "preparando o café…"
│   │   └── modo-simples/          → página '/simples', reutiliza os mesmos serviços e painéis
│   │
│   └── shared/
│       ├── ui/                    → painel, botao, tag, card-projeto, icone-link
│       └── utils/
│
├── (public/ — fica ao lado de src/, servido na raiz do site)
│   ├── mock/                      → projetos.json, skills.json, perfil.json, chat-respostas.json
│   ├── models/                    → *.glb por área
│   ├── textures/
│   ├── audio/
│   └── curriculo/                 → PDF
├── environments/                  → environment.ts (fonte de dados, URL da API)
└── styles/
    ├── _tokens.scss               → paleta, tipografia, espaçamentos, durações
    ├── _mixins.scss
    └── styles.scss
```

**Regra de dependências (vale explicar em entrevista):**
`features → core ← scene`. `features` e `scene` **nunca** se importam diretamente. `shared` não conhece ninguém. Dá para garantir isso com regra de lint (ex.: `eslint-plugin-boundaries`).

---

## 3. Modelagem das interfaces TypeScript

> Nomes em português para coincidir com o backend (`projeto`, `skill`, `perfil`, `chat`). Esses tipos são o **contrato** que a API vai respeitar.

```ts
// area.model.ts
export type Area = 'entrada' | 'livraria' | 'floricultura' | 'cafe' | 'aurora';

// skill.model.ts
export type CategoriaSkill = 'FRONTEND' | 'BACKEND' | 'BANCO' | 'OUTROS';

export interface Skill {
  id: string;            // slug estável, ex.: 'java', 'spring-boot'
  nome: string;          // 'Spring Boot'
  categoria: CategoriaSkill;
  destaque: boolean;     // Java, Spring Boot, Angular, PostgreSQL, IA
  ordem: number;
}

// projeto.model.ts
export interface Projeto {
  id: string;            // slug, usado em URL e no nome do objeto 3D
  nome: string;
  descricaoCurta: string;
  problema: string;
  funcionalidades: string[];
  tecnologias: string[]; // ids de Skill — é o que liga floricultura ↔ livraria
  githubUrl?: string;
  demoUrl?: string;
  destaque: boolean;     // vai para a prateleira iluminada
  ordem: number;
  corCapa?: string;      // token da paleta; usado para gerar o livro 3D
  placeholder?: boolean; // só nos mocks
}

export interface FiltroProjetos {
  tecnologia?: string;   // id de Skill
}

// perfil.model.ts
export interface Link {
  tipo: 'LINKEDIN' | 'GITHUB' | 'EMAIL' | 'OUTRO';
  url: string;
  rotulo: string;
}

export interface Experiencia {
  id: string;
  empresa: string;
  cargo: string;
  inicio: string;        // ISO 'YYYY-MM'
  fim?: string;          // ausente = atual
  descricao: string;
  tecnologias: string[];
}

export interface Formacao {
  id: string;
  instituicao: string;
  curso: string;
  inicio: string;
  fim?: string;
}

export interface Perfil {
  nome: string;
  titulo: string;        // 'Desenvolvedora Full Stack'
  apresentacao: string;
  objetivos: string;
  experiencias: Experiencia[];
  formacoes: Formacao[];
  links: Link[];
  curriculoUrl: string;
}

// chat.model.ts
export interface MensagemChat {
  autor: 'USUARIO' | 'AURORA';
  texto: string;
}

export interface PedidoChat {
  mensagem: string;
  historico: MensagemChat[]; // curto; o backend limita
}

export type Acao =
  | { tipo: 'NAVEGAR'; destino: Area }
  | { tipo: 'DESTACAR_PROJETOS'; tecnologia: string }
  | { tipo: 'ABRIR_PROJETO'; projetoId: string }   // proposta
  | { tipo: 'LIMPAR_DESTAQUE' };                   // proposta

export interface RespostaChat {
  mensagem: string;
  acoes: Acao[];
}
```

**Repositories (abstrações):**

```ts
export abstract class ProjetoRepository {
  abstract listar(filtro?: FiltroProjetos): Observable<Projeto[]>;
  abstract buscarPorId(id: string): Observable<Projeto | undefined>;
}
export abstract class SkillRepository   { abstract listar(): Observable<Skill[]>; }
export abstract class PerfilRepository  { abstract obter(): Observable<Perfil>; }
export abstract class ChatRepository    { abstract enviar(pedido: PedidoChat): Observable<RespostaChat>; }
```

Observações:
- `Acao` é uma **união discriminada**: o `switch (acao.tipo)` no executor fica checado pelo compilador, e uma ação desconhecida vinda do backend é ignorada com log em vez de quebrar a tela.
- `ABRIR_PROJETO` e `LIMPAR_DESTAQUE` são **propostas** minhas (não estavam no contexto) — confirme se quer manter.
- Repositories retornam `Observable` porque o `HttpClient` retorna `Observable`; no estado, converta para signal com `toSignal`. Assim, a troca para HTTP não muda nenhuma assinatura.

---

## 4. Arquitetura da cena 3D

### 4.1 Ciclo de vida
1. `ExperienciaComponent` renderiza `<canvas>` e, em `afterNextRender` (nunca roda no servidor/prerender), chama `sceneEngine.iniciar(canvas)`.
2. `SceneEngineService` cria renderer, cena, câmera, `CameraDirector`, `Interaction` e as áreas; dispara o carregamento dos assets.
3. Render loop com `renderer.setAnimationLoop`, chamando `area.update(dt)` em cada área e `cameraDirector.update(dt)`.
4. `ngOnDestroy` → `sceneEngine.destruir()`: para o loop, faz `dispose` de geometrias, materiais, texturas e renderer, e remove listeners.

### 4.2 Nota sobre zoneless × `runOutsideAngular`
O contexto previa `NgZone.runOutsideAngular()`. Nas versões recentes, o Angular cria projetos **zoneless** por padrão; aí o `requestAnimationFrame` já **não** dispara change detection e o `runOutsideAngular` vira um no-op.
- **Recomendação:** usar zoneless (mais moderno, sem zone.js). O argumento de entrevista continua o mesmo, só que mais forte: "o loop de 60 fps é isolado da detecção de mudanças; só mudanças de **signal** atualizam a UI, e a cena só escreve no estado em eventos discretos (clique, chegada na estação), nunca a cada frame."
- Se o projeto usar zone.js, aí sim o loop roda dentro de `runOutsideAngular`.

### 4.3 Estações e câmera
```ts
interface Estacao {
  area: Area;
  posicao: Vector3;
  alvo: Vector3;
  limites: { azimute: number; polar: number }; // rotação livre leve, em radianos
}
```
- `CameraDirector.irPara(area)`: interpola posição e alvo com easing (implementação própria com lerp + `easeInOutCubic`, para mostrar domínio do loop; GSAP é alternativa se ficar complexo).
- Dentro da estação: arrastar gira a câmera em volta do alvo dentro dos limites; solta → volta devagar ao enquadramento.
- `prefers-reduced-motion`: transição vira fade rápido.
- Ao chegar, o director avisa a ponte → estado `areaAtual` atualizado.

**Sobre a proposta de navegação:** concordo com a câmera guiada por estações. Caminhada livre é ruim no celular, desorienta quem não joga e faz o recrutador perder tempo. A única adição que sugiro é o **menu de estações sempre visível** no HUD, que também resolve a navegação por teclado.

### 4.4 Carregamento de modelos
- `AssetLoader` com `GLTFLoader` + `DRACOLoader` (+ `KTX2Loader` se usar texturas comprimidas); decoders servidos localmente em `public/`.
- Um `LoadingManager` alimenta um signal de progresso → tela de carregamento.
- **Carregamento progressivo:** casca do ambiente + entrada primeiro; livraria, floricultura e café logo em seguida, em segundo plano.
- Objetos dinâmicos (livros, plaquinhas) **gerados a partir dos dados**, não do GLB.

### 4.5 Raycasting (cliques e toques)
- Cada objeto interativo recebe `userData = { tipo: 'projeto' | 'skill' | 'cafe-item' | 'aurora', id }`.
- `Interaction` mantém uma **lista só dos objetos interativos** (não faz raycast na cena inteira) e usa `pointerdown/pointerup` com tolerância de movimento, para distinguir clique de arrasto.
- Hover (desktop): cursor `pointer` + destaque leve; checagem limitada a ~1x por frame, só quando o ponteiro se move.
- Resultado → callback `aoSelecionar({ tipo, id })` → ponte → estado.

### 4.6 A ponte: `PortfolioStateService`

```ts
@Injectable({ providedIn: 'root' })
export class PortfolioStateService {
  readonly areaAtual        = signal<Area>('entrada');
  readonly projetoSelecionado = signal<string | null>(null);
  readonly skillSelecionada = signal<string | null>(null);
  readonly filtroTecnologia = signal<string | null>(null);

  readonly projetos = toSignal(inject(ProjetoRepository).listar(), { initialValue: [] });
  readonly projetosDestacados = computed(() => {
    const tec = this.filtroTecnologia();
    return tec ? this.projetos().filter(p => p.tecnologias.includes(tec)).map(p => p.id) : [];
  });

  irPara(area: Area) { … }
  selecionarProjeto(id: string | null) { … }
  selecionarSkill(id: string | null) { … }   // também define filtroTecnologia
  limparDestaque() { … }
}
```

`SceneBridgeService` (Angular, mas sem componentes) é a **única** peça que conhece os dois lados:

```
                ┌───────────────────────────┐
  Clique na  ──►│ Interaction (Three.js)    │── aoSelecionar ─┐
  cena          └───────────────────────────┘                 │
                                                              ▼
 Aurora ──► AcaoExecutor ──────────────────────────► PortfolioStateService (signals)
 Modo simples / painéis ───────────────────────────►        │
                                                              │ effect()
                ┌───────────────────────────┐                 │
                │ SceneBridgeService        │◄────────────────┘
                │  areaAtual → director.irPara
                │  projetosDestacados → livraria.destacar(ids)
                └───────────────────────────┘
  Painéis Angular leem os mesmos signals e abrem/fecham sozinhos.
```

- As áreas (`LivrariaArea` etc.) são **classes TS puras**, testáveis sem Angular: recebem dados e expõem métodos (`destacar(ids)`, `selecionar(id)`).
- Escrita no estado só em **eventos discretos**, nunca no loop.

---

## 5. Estratégia de assets 3D

**Recomendação realista para quem está começando: CC0 + montagem/ajuste no Blender. Modelagem própria só para peças pequenas e únicas.**

| Abordagem | Prós | Contras | Uso |
|---|---|---|---|
| Modelar tudo no Blender | Identidade total | Meses de curva de aprendizado; risco alto de parecer amador | ❌ |
| Assets CC0 adaptados | Rápido, coerente, qualidade boa | Exige escolher kits de **estilo compatível** | ✅ base |
| Geração por código | Escala com os dados (novos projetos sem Blender) | Só para formas simples | ✅ livros, plaquinhas, folhas |
| Modelagem própria pontual | Personalidade | Tempo | ✅ placa da fachada, cardápio, detalhes |

**Fontes CC0 / gratuitas para pesquisar:** Kenney (kits low-poly de móveis e interiores), Quaternius (móveis, plantas, personagens), Poly Pizza (agregador de modelos low-poly), Poly Haven (texturas e HDRIs). **Sempre conferir a licença de cada asset** e registrar a origem num `CREDITOS.md`.

**Pipeline**
1. Escolher **um** estilo low-poly principal e manter todos os assets nele.
2. Montar a cena no Blender sobre a ilustração conceitual.
3. Repintar para a paleta (atlas de cores pequeno = poucos materiais = poucos draw calls).
4. Juntar a geometria estática em poucos objetos; manter interativos separados e nomeados.
5. Bake de luz (lightmap) → luz quente e "cara" com custo quase zero em tempo de execução.
6. Exportar GLB + Draco; validar com o gltf-viewer / gltf-transform.

**Aurora:** ver risco em [§8](#8-riscos-e-pontos-de-atenção).

---

## 6. Estratégia mobile e performance

**Orçamentos iniciais (ajustar após medir):**

| Métrica | Desktop | Mobile |
|---|---|---|
| Download inicial de 3D (GLB + texturas) | ≤ 5 MB | ≤ 3 MB |
| Triângulos visíveis | ≤ 300k | ≤ 100k |
| Draw calls | ≤ 150 | ≤ 60 |
| Pixel ratio máximo | 2 | 1,5 |
| FPS alvo | 60 | 30+ estável |

**Táticas**
- Luz bakeada + pouquíssimas luzes dinâmicas; sombras em tempo real só no nível alto.
- Atlas de texturas, KTX2, Draco, instancing (folhas, livros).
- `renderer.setPixelRatio(Math.min(devicePixelRatio, limite))`.
- Pausar o loop com a aba oculta; reduzir a taxa de render quando a câmera está parada e nada se anima (opcional).
- Bundle: `three` só no chunk lazy da rota `/` — o `/simples` não baixa Three.js.
- Detecção: WebGL2 disponível? memória/núcleos (`navigator.deviceMemory`, `hardwareConcurrency`) como dica inicial + amostragem de FPS → ajusta o nível.
- Fallback para `/simples` com mensagem gentil.

---

## 7. Aurora no front: mock agora, backend depois

**Agora (mock)**
```
aurora-chat (UI) ──► ChatRepository (abstrato)
                         └── ChatMockRepository
                               • regras por palavra-chave/intenção (chat-respostas.json)
                               • usa os dados do ProjetoRepository para respostas como
                                 "Tenho 2 projetos com Java: …"
                               • desconhecido → "Essa informação não está disponível no portfólio."
                ◄── RespostaChat { mensagem, acoes }
aurora-chat ──► AcaoExecutorService ──► PortfolioStateService ──► cena / modo simples
```
- O mock simula latência (~600 ms) para a UI de "digitando…" ser real.
- Testes cobrem o **executor** com cada tipo de `Acao` — eles continuam válidos depois.

**Depois (backend)**
- Criar `ChatHttpRepository` → `POST /api/chat` com `PedidoChat`, recebendo `RespostaChat`.
- Trocar `provideDados('mock')` → `provideDados('http')` em `app.config.ts`. **Nenhum componente muda.**
- Tratar no front: erro de rede / 429 (rate limit) → mensagem amigável da Aurora; timeout; ação desconhecida ignorada.
- A chave do Gemini **nunca** chega ao navegador: ela só existe no backend.

---

## 8. Riscos e pontos de atenção

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| **Escopo da arte 3D** consumir meses | Alta | Alto | Grey-box primeiro; CC0; `/simples` já publicado; arte é iterável |
| **Personagem Aurora 3D** (personagem é a parte mais difícil de 3D) | Alta | Médio | Opção A: avatar **2D ilustrado** no painel do chat + presença 3D simples (silhueta/low-poly CC0 com idle). Opção B: personagem CC0 com recolor. Decidir na fase 6 |
| Estilos de assets inconsistentes ("colcha de retalhos") | Média | Alto | Um kit principal; repintar tudo para a mesma paleta |
| Peso dos modelos / carregamento lento | Média | Alto | Orçamentos de [§6](#6-estratégia-mobile-e-performance), carregamento progressivo, medir no CI (tamanho de bundle/assets) |
| Performance em celulares fracos | Média | Alto | Níveis de qualidade + fallback automático |
| Curva de aprendizado Three.js/Blender | Alta | Médio | Fase 4 dedicada, sandboxes descartáveis |
| Parecer infantil | Média | Alto | Paleta sóbria, tipografia elegante, animações sutis, poucos elementos "fofos" |
| Recrutador sem paciência para o 3D | Alta | Médio | Link para `/simples` sempre visível; 3D pulável; deep links de projeto |
| Conteúdo real atrasar (projetos, currículo) | Média | Médio | Placeholders marcados; checklist de conteúdo antes do lançamento |
| Vazamento de memória ao trocar de rota | Média | Médio | `dispose` rigoroso, testar navegar `/` ↔ `/simples` várias vezes |
| Licenças de assets | Baixa | Alto | Só CC0 ou licença compatível; `CREDITOS.md` |

---

## 9. Visão resumida das fases de backend (para não bloquear nada no front)

| # | Fase | O que o front precisa já ter |
|---|---|---|
| B0 | Setup Spring Boot 3 / Java 21, Docker, CI | — |
| B1 | Módulos `projeto`, `skill`, `perfil` + PostgreSQL + Flyway (seed = conteúdo dos mocks) | Interfaces de [§3](#3-modelagem-das-interfaces-typescript) estáveis; JSON mock **no mesmo formato** dos DTOs |
| B2 | Endpoints `GET /api/projetos?tecnologia=`, `/api/skills`, `/api/perfil` + CORS | Implementações `Http*Repository`; troca em `app.config.ts` |
| B3 | Módulo `chat`: `LlmClient` → `GeminiClient`, function calling (`buscarProjetos`, `navegarPara`), grounding na instrução de sistema | `ChatHttpRepository`; executor já testado |
| B4 | Rate limiting, limite de tokens, histórico curto, fallback | Tratamento de erro/429 no chat |
| B5 | Deploy (Cloud Run/Render + Neon/Supabase), observabilidade | `environment.prod` com URL da API |

**Garantias no front para essa transição:**
- Contratos tipados e JSON mock idêntico aos DTOs (o seed do Flyway pode ser gerado dos próprios JSONs).
- Toda chamada de dados passa por um repository abstrato.
- O executor de ações não sabe de onde a resposta veio.
- Datas em ISO e IDs em slug, combinados desde já.

---

## 10. Decisões técnicas (formato entrevista)

| Decisão | Por quê | Alternativa descartada |
|---|---|---|
| Angular standalone + signals | Menos boilerplate; reatividade fina e explícita | NgModules |
| Zoneless | Loop de 60 fps não dispara change detection; menos mágica | zone.js + `runOutsideAngular` (ainda válido se necessário) |
| Signals + serviço de estado | Estado pequeno e claro; fácil de explicar | NgRx: cerimônia sem retorno nesse tamanho |
| Three.js puro, encapsulado em serviços | Mostra domínio do render loop e de ciclo de vida | Wrappers declarativos (ex.: angular-three): escondem justamente o que quero demonstrar |
| Cena isolada do Angular via estado | Cada lado testável sozinho; cena, Aurora e modo simples usam o mesmo mecanismo | Componentes manipulando objetos 3D |
| Repository + DI com mock/http | Front completo sem backend; troca em um único lugar | Serviços chamando `HttpClient` direto |
| `Acao` como união discriminada | Compilador garante cobertura; ações do LLM viram comandos seguros | Strings soltas |
| Câmera por estações | Igual em desktop e mobile; não desorienta | Primeira pessoa livre |
| Painéis em HTML sobre a cena | Acessível, selecionável, indexável, responsivo | Texto dentro do 3D |
| `/simples` primeiro, com prerender | MVP público cedo; SEO; acessibilidade; fallback | Só 3D |
| GLB + Draco + luz bakeada | Visual quente com custo baixo em tempo de execução | Luz dinâmica com sombras em tempo real |
| Livros e plaquinhas gerados dos dados | Novo projeto aparece sem abrir o Blender | Modelar cada livro |
| `InstancedMesh` para folhas | Centenas de folhas em 1 draw call | Um mesh por folha |
| Assets CC0 adaptados | Realista para quem está começando no 3D; qualidade consistente | Modelar tudo do zero |
| Níveis de qualidade adaptativos | Mesma experiência em mais aparelhos | Uma qualidade fixa |
| Chave do Gemini só no backend | Segurança: nada sensível no navegador | Chamar o Gemini do front |
| Regra de lint de fronteiras entre pastas | Arquitetura garantida por ferramenta, não por disciplina | Só convenção |

---

## Pendências que dependem de você

- [ ] Lista real de projetos (nome, descrição, problema, funcionalidades, tecnologias, links).
- [ ] Experiência profissional, formação, objetivos e texto de apresentação.
- [ ] Currículo em PDF.
- [ ] Links de LinkedIn e GitHub.
- [ ] Ilustração conceitual anexada ao repositório (`docs/referencia/`).
- [ ] Idioma: só português, ou português + inglês? (afeta i18n desde a fase 2)
- [ ] Domínio próprio?
- [ ] Confirmar as ações propostas `ABRIR_PROJETO` e `LIMPAR_DESTAQUE`.
- [ ] Música ambiente: fonte com licença livre.
