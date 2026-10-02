# Portfólio — Café, Livraria e Floricultura de Outono

Portfólio pessoal interativo em 3D de **Adrielly**, desenvolvedora Full Stack.

> 🚧 Em construção.

## Estrutura

| Pasta | Conteúdo | Status |
|---|---|---|
| [`frontend/`](frontend/) | Angular (standalone, signals, zoneless) + Three.js | Em desenvolvimento |
| `backend/` | Java 21 + Spring Boot 3 + PostgreSQL + Gemini | Fase posterior |

## Rodando o frontend

Requer Node.js 22.22.3+ (ou 24.15+).

```bash
cd frontend
npm install
npm start          # http://localhost:4200
npm run lint
npm run test:ci
npm run build      # saída estática pré-renderizada em dist/portfolio/browser
```
