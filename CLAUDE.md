# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

GQWallet is a personal finance SPA for `qs-gqwallet-api`, built with React 19, TypeScript 6, Vite 8, Tailwind CSS 4 and `react-router` 8. Follow Quedena Studio's `qs-react-frontend` layered architecture and the README in each source layer.

## Commands and environment

```bash
npm run dev        # Vite dev server on port 5173
npm run build      # tsc -b && vite build
npm run lint       # eslint .
npm run typecheck  # tsc -b
npm run test       # vitest run (once)
npm run test:e2e   # playwright test
npm run preview   # vite preview

npx vitest run src/hooks/useCardDetail.test.ts  # single test file
npx vitest                                    # watch mode
```

Use `.env.example` as the local `.env` template:

- `VITE_API_BASE_URL`: backend base URL; defaults to `http://localhost:8080`. `src/services/config.ts` normalizes trailing slashes and an optional `/api/v1` suffix; the client adds `/api/v1`.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID for Calendar consent; without it, `googleConsentUrl` returns `null`. The backend exchanges the authorization code.

Use `@/` for cross-directory imports: it resolves to `src/` in `vite.config.ts` (also used by Vitest) and `tsconfig.app.json`.

## Layers and boundaries

- `src/components/ui/`: reusable design-system primitives; `layout/`: shell and shared layouts; `<feature>/`: feature components. Components receive data through props and emit actions through callbacks. Do not import services, data hooks or context, or another feature's components.
- `src/pages/`: one `<Name>Page.tsx` per screen; compose components and obtain data/actions from hooks. No direct service calls or API error handling.
- `src/hooks/`: UI state and use cases; compose services. Reuse `useResource` for cancellable reads (`data`, `isLoading`, `error`, `refetch`) and `useMutation` for writes (`submit`, `isSubmitting`, `error`, `reset`). No JSX or styling.
- `src/services/`: typed async backend access through `apiClient`, generally one `<resource>.service.ts` per resource. No React or UI state.
- `src/context/`: shared session (`AuthContext`) and notifications (`ToastContext`); keep page-local state in hooks.
- `src/utils/`: formatting, parsing and other non-React helpers; no network calls.
- `src/types/`: backend resource and transport types, plus `ApiError`.
- `src/navigation/`: route table, paths, titles and guards.
- `src/styles/`: global stylesheet and design tokens.

`eslint.config.js` enforces restricted `@/services` imports in pages/components (type-only imports allowed) and restricted `@/context` imports in components. It also checks React Hooks, rejects explicit `any` and validates TSDoc syntax. The remaining layer boundaries are project conventions, not all ESLint-enforced.

## HTTP, auth and server values

`src/services/api-client.ts` owns the single Axios instance, with `withCredentials: true`, typed verbs, abort signals and failure conversion to `ApiError`. Route backend requests through it. The JWT is an httpOnly session cookie; do not read, store or manually attach a bearer token.

`AuthProvider` in `src/context/AuthContext.tsx` probes `GET /profiles/me` through `profilesService.getMine` on mount, exposing `checking`, `authenticated` or `anonymous` status, profile and roles. Navigation guards consume this state; backend authorization remains authoritative.

Display server-computed financial values as returned. In particular, do not re-derive `NextBilling.amountDue`, billing/payment cycle projections, credit-line usage, account/available balances, dashboard figures or budget totals/states from transaction rows. Consult the existing services and response types before adding financial calculations.

## Styling and documentation

Tailwind 4 runs through `@tailwindcss/vite`. `src/styles/global.css` defines colors, typography, radii and shadows in `@theme`; use token utilities such as `bg-surface-card`, `text-content-primary` and `rounded-lg`. Keep raw color definitions in that stylesheet and layouts mobile-first.

Document exports and props with TSDoc in English, following existing examples (`@param`, `@returns`, `@throws`, `@example` where applicable). File headers include `@author` and `@packageDocumentation`. ESLint checks syntax; it does not enforce English or documentation coverage.

## Testing

Vitest and React Testing Library run colocated `src/**/*.test.{ts,tsx}` in jsdom, configured in `vite.config.ts` with globals enabled. `src/test/setup.ts` installs jest-dom matchers and DOM cleanup. Hook tests mock services; service tests mock `apiClient`.

Playwright tests in `e2e/` exercise the real local backend and create test users/data. Start `qs-gqwallet-api` and PostgreSQL separately; Playwright starts or reuses only the frontend at `http://localhost:5173`. Tests use installed Google Chrome with desktop and mobile viewports, one worker and `es-PE`/`America/Lima`. The admin test additionally needs Docker access to `qs-gqwallet-api-postgres-1` for role provisioning (see `e2e/helpers.ts`).
