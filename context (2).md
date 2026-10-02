# Contexto do Projeto — Portfólio 3D "Café, Livraria e Floricultura de Outono"

## Seu papel nesta tarefa

Você vai me ajudar a **planejar** o desenvolvimento do meu portfólio pessoal 3D. Nesta etapa eu **não quero código ainda**: quero um planejamento técnico detalhado, organizado em fases e tarefas, que eu possa seguir e explicar em entrevistas.

> **Prioridade: quero começar pelo FRONTEND.**
> O backend (Java + Spring Boot + PostgreSQL + Gemini) virá depois. O planejamento deve permitir que o frontend seja construído e funcione de forma completa usando dados mockados, e que depois a troca para a API real seja simples, sem retrabalho.

Se algo neste documento estiver ambíguo ou faltando, **faça perguntas antes de assumir**. Não invente informações sobre minha carreira, projetos ou tecnologias.

---

## Sobre mim

- Nome: **Adrielly**
- Desenvolvedora **Full Stack**
- Principais tecnologias: **Angular** no frontend e **Java/Spring Boot** no backend, além de PostgreSQL, Kafka, Docker e soluções com IA.

---

## Conceito

O portfólio é uma experiência interativa 3D baseada em um sonho meu: um lugar aconchegante que mistura **livraria, floricultura e café**, com estética de **outono**. O visitante "entra" no espaço, explora e descobre minha trajetória de forma natural, em vez de ler uma lista de tecnologias.

**Atmosfera:** aconchegante, alegre, colorida mas elegante, acolhedora, com personalidade e detalhes que façam o ambiente parecer vivo. **Bonita e profissional, nunca infantil.**

**Paleta:** terracota, laranja queimado, amarelo, verde, marrom, creme, com detalhes em rosa/lilás.

**Referência visual:** tenho uma ilustração conceitual (fachada de madeira com porta aberta, estantes de livros à esquerda, floricultura ao centro com plaquinhas de skills, balcão de café à direita com uma atendente de óculos, notebook e cardápio sobre a mesa, folhas de outono caindo na rua de paralelepípedos). Vou anexá-la junto quando necessário.

---

## As três áreas

### 📚 Livraria — Projetos
- Cada livro na estante representa um projeto.
- Ao clicar, abre um painel com: nome, descrição curta, tecnologias, problema que resolve, principais funcionalidades, GitHub e demo (quando existir).
- Projetos com **Java, Spring Boot, Angular, PostgreSQL e IA** devem ter destaque (ex.: prateleira especial iluminada).
- **Os projetos reais ainda serão cadastrados por mim.** Use dados de exemplo claramente marcados como placeholder.

### 🌷 Floricultura — Skills
As skills fazem parte visual do ambiente (vasos com plaquinhas, etiquetas, prateleiras por categoria), não uma lista.

| Categoria | Skills |
|---|---|
| Frontend | Angular, TypeScript, HTML, SCSS, UX/UI |
| Backend | Java, Spring Boot, Groovy/Grails, APIs REST |
| Banco | PostgreSQL, MySQL, SQL |
| Outros | Kafka, Docker, Git, IA / LLMs |

Ideia de interação: clicar em uma skill (ex.: vaso "Java") faz os livros/projetos que usam essa tecnologia se destacarem na livraria. Skills e projetos ficam conectados.

### ☕ Café — Sobre mim / Currículo
Mesa com objetos clicáveis: notebook (apresentação), cardápio (trajetória/experiência), pasta (currículo em PDF). Conteúdo: apresentação, experiência profissional, formação, trajetória e objetivos profissionais.

---

## 🤖 IA — "Aurora"

Uma personagem atendente da livraria/café que funciona como **guia virtual do portfólio**.

- Responde **somente** com informações cadastradas no portfólio; se não souber, diz que a informação não está disponível.
- Ajuda a encontrar projetos por tecnologia ou tipo.
- Pode disparar ações na cena (ex.: "quero ver projetos com Java" → câmera vai até a livraria e destaca os livros certos).

Exemplo de contrato de resposta que o backend vai devolver no futuro:

```json
{
  "mensagem": "Claro! Vou te mostrar os projetos com Java.",
  "acoes": [
    { "tipo": "NAVEGAR", "destino": "livraria" },
    { "tipo": "DESTACAR_PROJETOS", "tecnologia": "Java" }
  ]
}
```

**Importante para a fase de frontend:** a chave do Gemini **nunca** pode ficar no navegador. Na fase de front, a interface do chat deve ser construída completa, mas respondendo com um **mock** que segue esse contrato (respostas pré-definidas + execução das ações na cena). A integração real com o Gemini acontece na fase de backend.

---

## 🖱️ Navegação e UX

- O usuário "entra" pela porta e explora as áreas: livraria, floricultura, café, conversa com a Aurora, links para LinkedIn/GitHub.
- Proposta de navegação: **câmera guiada entre "estações"** (porta → livraria → floricultura → café), com clique/toque em áreas e objetos, e leve rotação livre dentro de cada estação. Motivo: funciona igual no desktop e no celular (caminhada livre em primeira pessoa é ruim no mobile). Se você enxergar alternativa melhor, argumente.
- **Navegação alternativa simples** (ex.: rota `/simples`): versão 2D tradicional com os mesmos dados, para recrutadores com pressa, acessibilidade, SEO e fallback para dispositivos fracos.
- Respeitar `prefers-reduced-motion`.
- Música ambiente **opcional**, desligada por padrão, com botão de ligar/desligar.
- Tela de carregamento temática (ex.: "preparando o café...").

### Detalhes do ambiente
Folhas de outono caindo (partículas), plantas e flores, livros, xícaras, luminárias, mesas de madeira, estantes, quadros, computador, objetos decorativos, animações sutis, iluminação quente e aconchegante.

---

## 💻 Stack e decisões técnicas

### Frontend (FOCO AGORA)
- **Angular** (versão estável mais recente, standalone components, signals)
- **TypeScript**
- **Three.js** encapsulado em serviço(s) Angular (preferência por Three.js puro para demonstrar domínio do render loop)
- Render loop rodando com `NgZone.runOutsideAngular()` para não disparar change detection a cada frame
- Modelos 3D em **GLB** com compressão Draco; estilo low-poly estilizado; iluminação possivelmente "bakeada"
- Folhas caindo com `InstancedMesh`
- Painéis de conteúdo em HTML/CSS sobrepostos à cena (não texto dentro do 3D)
- SCSS com design tokens da paleta de outono
- Responsivo (desktop e mobile), com limite de pixel ratio e ajustes de qualidade para celulares

**Estratégia para desacoplar do backend:**
- Definir desde já as **interfaces TypeScript** que espelham os contratos da futura API (Projeto, Skill, Perfil, Experiencia, Formacao, RespostaChat, Acao).
- Dados mockados em JSON.
- Serviços de dados atrás de uma abstração (ex.: injection token / classe abstrata) com implementação **mock** agora e implementação **HTTP** depois — trocar via configuração/providers, sem mexer nos componentes.

### Backend (FASE POSTERIOR — só para contexto)
- Java 21 + Spring Boot 3, pacotes por domínio (`projeto`, `skill`, `perfil`, `chat`)
- PostgreSQL + Flyway (dados versionados)
- Endpoints previstos: `GET /api/projetos?tecnologia=`, `GET /api/skills`, `GET /api/perfil`, `POST /api/chat`
- Gemini via SDK oficial Java ou Spring AI, com **function calling** (`buscarProjetos`, `navegarPara`)
- Grounding colocando os dados do portfólio na instrução de sistema (conteúdo pequeno, sem necessidade de RAG/banco vetorial)
- Rate limiting, limite de tokens, histórico curto, fallback amigável em caso de erro
- Autenticação **só se houver necessidade real** (ex.: painel admin); caso contrário, não
- Docker, CI com GitHub Actions; deploy previsto: front em Vercel/Netlify/Firebase, back em Cloud Run/Render, Postgres em Neon/Supabase

---

## 🏗️ Arquitetura escolhida

Já tenho uma direção de arquitetura definida. Use-a como base do planejamento; se identificar problemas reais, aponte e justifique, mas não proponha algo mais complexo sem necessidade.

### Frontend: feature-based em três camadas, com o 3D isolado do Angular

Princípio central: **a cena Three.js não conhece componentes Angular, e os componentes não manipulam objetos 3D diretamente.** Os dois se comunicam por um serviço de estado com signals.

```
src/app/
├── core/            → serviços globais, estado, providers de dados
│   ├── state/       → PortfolioStateService (signals: área atual, projeto selecionado, filtro)
│   ├── data/        → abstrações + implementações mock e http
│   └── models/      → interfaces (Projeto, Skill, Perfil, RespostaChat...)
├── scene/           → "motor" 3D, sem dependência de componentes
│   ├── scene-engine.service.ts   → renderer, loop, resize
│   ├── camera-director.ts        → transições entre estações
│   ├── interaction.ts            → raycasting (cliques/toques)
│   └── areas/                    → livraria, floricultura, cafe, folhas
├── features/        → UI de cada área (painéis HTML sobre a cena)
│   ├── livraria/  floricultura/  cafe/  aurora-chat/
│   └── modo-simples/             → versão 2D, reaproveita os mesmos serviços
└── shared/          → componentes visuais reutilizáveis (painel, botão, tag)
```

**Fluxo de comunicação:**
- Usuário clica em um livro → a cena detecta (raycasting) → atualiza o `PortfolioStateService` ("projeto X selecionado") → o painel da livraria reage ao signal e abre.
- Caminho inverso: a Aurora devolve a ação `NAVEGAR: livraria` → o estado muda → a cena move a câmera.
- Cliques na cena, ações da Aurora e o modo simples usam **o mesmo mecanismo de estado**, sem lógica duplicada.

**Dados com padrão Repository + injeção de dependência:**
- Classe abstrata (ex.: `ProjetoRepository`) com duas implementações: `ProjetoMockRepository` (agora) e `ProjetoHttpRepository` (depois).
- A troca acontece em um único lugar: os providers em `app.config.ts`. Nenhum componente muda.

**Estado:** signals + serviço de estado. NgRx foi descartado por ser cerimônia desnecessária para o tamanho do projeto.

### Backend (fase posterior): monólito modular

Um único Spring Boot organizado por domínio, com camadas dentro de cada módulo. Microsserviços foram descartados: trariam complexidade de deploy e comunicação sem benefício real neste projeto.

```
com.adrielly.portfolio/
├── projeto/   → controller, service, repository, entity, dto
├── skill/
├── perfil/
└── chat/      → ChatService + interface LlmClient → GeminiClient
```

O `ChatService` depende da interface `LlmClient`, não do Gemini diretamente. Isso facilita testes (mock) e troca de provedor. É o mesmo princípio do Repository no frontend, dando coerência ao projeto inteiro.

### Justificativa geral
Escolhi a arquitetura **proporcional ao problema**: organizada o suficiente para separar responsabilidades e permitir evolução (para NgRx ou Clean Architecture, se um dia fizer sentido), sem complexidade que não se paga.

---

## Princípios do projeto

- **Nada de funcionalidade só por ser "legal".** Cada recurso precisa ter finalidade e demonstrar alguma habilidade minha (frontend, backend, IA ou UX).
- Arquitetura organizada e fácil de explicar em entrevista.
- Boas práticas de UX/UI, acessibilidade e performance.
- Resultado: memorável, profissional, elegante, colorido e acolhedor — ao mesmo tempo portfólio, projeto técnico e demonstração de habilidades.

---

## O que eu espero do seu planejamento

1. **Fases do frontend** em ordem de execução, cada uma com objetivo, tarefas, critério de "pronto" e o que ela demonstra tecnicamente.
2. **Detalhamento da estrutura de pastas** a partir da arquitetura definida acima (arquivos principais de cada pasta e responsabilidade de cada um).
3. **Modelagem das interfaces TypeScript** (os contratos que o backend vai respeitar depois).
4. **Arquitetura da cena 3D:** como organizar cena, câmera, estações, carregamento de modelos, detecção de cliques (raycasting), e como o `PortfolioStateService` faz a ponte entre a cena e os componentes Angular.
5. **Estratégia de assets 3D:** criar no Blender vs. usar assets CC0 e adaptar; o que é mais realista para mim.
6. **Estratégia mobile e performance.**
7. **Como a Aurora funciona no front com mock** e como será a troca para o backend real.
8. **Riscos e pontos de atenção** (ex.: escopo, peso dos modelos, tempo de produção de arte).
9. **Visão resumida das fases de backend** que virão depois, só para garantir que nada no front bloqueie a integração.
10. **Lista de decisões técnicas** com a justificativa de cada uma, no formato que eu possa usar em entrevista.

Antes de entregar o plano, me faça as perguntas que considerar essenciais (ex.: nível de experiência com Three.js/Blender, tempo disponível por semana, prazo desejado).
