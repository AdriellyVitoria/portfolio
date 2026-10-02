# Frontend — Portfólio

Angular 22 (standalone, signals, zoneless), SCSS com design tokens e, nas próximas fases, Three.js.

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Servidor de desenvolvimento em `http://localhost:4200` |
| `npm run lint` | ESLint, incluindo as fronteiras entre camadas |
| `npm run format` / `format:check` | Prettier |
| `npm test` / `test:ci` | Testes unitários (Vitest) |
| `npm run build` | Build de produção estático e pré-renderizado (`dist/portfolio/browser`) |

## Arquitetura

```
src/app/
├── core/       → modelos, repositories (mock/http), estado com signals
├── scene/      → motor Three.js, sem dependência de componentes
├── features/   → UI de cada área e o modo simples
└── shared/     → componentes visuais reutilizáveis
```

Regras de dependência garantidas pelo ESLint (`eslint-plugin-boundaries`):

- `features` → `core`, `shared`, outras `features`
- `features/experiencia-3d` → também `scene` (é quem hospeda o canvas)
- `scene` → `core`
- `core` → `core`
- `shared` → `shared`

Estilos globais ficam em `src/styles/`. Componentes usam `@use 'mixins' as *;`; `_tokens.scss` só é importado em `styles.scss`, porque gera CSS.

Detalhes no [plano](../plano.md).
