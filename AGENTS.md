# AGENTS.md — Glossé Nails mobile app (Expo + Convex)

Project-specific guidance for AI coding agents (Claude Code, Codex, Cursor, etc.).
Read this first. Keep `CLAUDE.md` as a pointer only to avoid drift.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## What this is

A React Native app (built with **Expo**) for salon operations at Glossé Nails
(Vancouver). Technicians use it for queues, payroll, transactions, gift
cards, and shift management. The backend is **Convex** (serverless functions +
realtime DB), with `@convex-dev/auth` for authentication.

## Stack (current as of this writing — keep fresh by running `npm outdated`)

- **Expo SDK 56** (bare-ish workflow via `expo-router` for file-based routing)
- **React 19** + **React Native 0.85**
- **TypeScript ~6** (strict mode)
- **Convex** latest (functions in `convex/`, schema in `convex/schema.ts`)
- **@convex-dev/auth** for auth
- **Biome 2** for formatting/lint of non-React files; **ESLint 9 (flat)** via
  `eslint-config-expo/flat` for the app
- **Tailwind 4** + **uniwind** for styling; `tailwind-merge` for class merging
- **zod 4** for runtime validation (see `utils/validation.ts`)
- **Vitest** for unit tests (node environment)
- Build/distribution: **EAS** (`eas.json`)

Package manager: **npm** (lockfile `package-lock.json`). Node 22 (see `.nvmrc`).

## Commands

- `npm install` — install deps
- `npm run start` — `expo start` (dev server)
- `npm run android` / `npm run ios` / `npm run web` — platform runners
- `npm run lint` — `expo lint` (ESLint 9 flat config)
- `npm run typecheck` — `tsc --noEmit` (strict TS)
- `npm test` — `vitest run` (unit tests for `utils/`)
- `npx convex dev` — run Convex dev deployment locally against your backend
- `npx expo lint` / `npx biome check .` — formatting/lint passes

CI runs `lint`, `typecheck`, and `test` on every PR (see `.github/workflows/ci.yml`).

## Layout

- `app/` — Expo Router screens (file-based routing)
- `components/` — UI components (incl. `components/Form/` with `constants.ts`, `validation.ts`)
- `contexts/` — React context providers (theme, date)
- `hooks/` — shared hooks (`use-authorization`, `use-form-validation`, etc.)
- `utils/` — **pure logic**: `date-utils.ts`, `validation.ts`, `types.ts`
- `convex/` — backend: `schema.ts`, `auth.ts`, `auth.config.ts`, domain modules
  (`transactions.ts`, `shifts.ts`, `giftCards.ts`, `users.ts`, `categories.ts`)
- `assets/` — static assets

## Rules for agents

- **Use npm.** Never run `yarn` or `pnpm`; it will desync `package-lock.json`.
- **Conventional Commits** (`feat:`, `fix:`, `refactor:`, …). `commitlint`
  enforces this on every commit via the `commit-msg` hook (lefthook).
- **Before reporting work done:** run `npm run lint && npm run typecheck && npm test`.
  CI runs the same gates on every PR.
- **Pre-commit is automatic:** lefthook runs `lint`, `typecheck`, and `test`
  (staged scope) on every commit. Don't disable it.
- **Env / Convex:** client config lives in `.env` (copy `.env.example`).
  - `EXPO_PUBLIC_CONVEX_URL` — public Convex deployment URL (client-safe).
  - `CONVEX_SITE_URL` / `SiteUrl` — backend site URL (server-only).
  - `EXPO_SCHEME`, `ALLOWED_REDIRECT_SCHEMES` — OAuth redirect config (auth).
  - `@convex-dev/auth` provider secrets (e.g. `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`)
    are server-only; never commit `.env`.
- **Pure logic gets tests:** `utils/*` helpers (date math, zod schemas) are
  unit-tested with Vitest. Add/extend a test whenever you change or add such logic.
- **Path alias:** `@/*` maps to repo root (`./*`). Use it for imports.
- **Branching:** work on a feature branch and open a PR; `main` is protected.
- **Scope changes:** edits to `convex/schema.ts` or auth affect the live backend —
  be conservative and coordinate deployments.

## Testing

- Unit tests live in `utils/**/*.test.ts` and run with Vitest (node environment).
- Test pure functions (e.g. `isToday`, `formatDate`, `EarningFormSchema`).
  Avoid testing React components or network/Convex code without mocking.
- Run `npm test` (or `npx vitest` for watch mode).
