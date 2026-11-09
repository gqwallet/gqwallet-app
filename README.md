# GQWallet App

Personal finance web app for GQWallet: accounts, credit cards, income and expenses, fixed payments, budgets, savings goals, cash flow, reports, calendar sync and CSV exports, in PEN and USD without mixing currencies. It is the frontend of [`qs-gqwallet-api`](../qs-gqwallet-api) and implements the GQWallet requirements specification v0.9.2 (all FRs except the *Won't* ones) with the Figma mockups as visual reference.

## Stack

| Concern | Choice |
|---|---|
| UI | React 19.3 + TypeScript 6.0 |
| Build | Vite 8.3 |
| Routing | React Router 8.5 |
| Styling | Tailwind CSS 4.3 with the GQWallet design tokens (`src/styles/global.css`), mobile-first |
| HTTP | Axios 1.21 behind a single client (`src/services/api-client.ts`), session in an httpOnly cookie |
| Icons and font | Material Symbols Rounded, Inter |
| Unit tests | Vitest 5 + Testing Library |
| End-to-end tests | Playwright 1.65 (desktop and iPhone 16 Pro viewports) |
| Lint | ESLint 10 + typescript-eslint + TSDoc |

## Architecture

Layered React architecture (Quedena Studio `qs-react-frontend`):

```
src/
├── components/   ui/ (design-system primitives), layout/ (shell), <feature>/ (feature components)
├── pages/        one screen per file; data comes from hooks
├── hooks/        use cases: loading, writing and state of each screen
├── services/     typed access to the backend (one file per bounded context)
├── context/      session and toasts
├── navigation/   routes, guards and paths
├── types/        backend resources and transport types
└── utils/        pure formatting, parsing and labels
```

Pages never call services, components never read context or services, and services never import React. `python3 audit_frontend.py .` (from the `qs-react-frontend` skill) checks these rules.

## Getting started

```bash
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev                   # http://localhost:5173
```

The backend must allow `http://localhost:5173` in `CORS_ALLOWED_ORIGIN`. Google Calendar sync needs `VITE_GOOGLE_CLIENT_ID` and the matching client configured in the backend.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Type-check and production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests against the running backend (Postgres + `qs-gqwallet-api`) using the installed Google Chrome |
