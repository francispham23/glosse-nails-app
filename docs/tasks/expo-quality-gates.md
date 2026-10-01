# Task: Expo quality gates

## Contract

- Status: complete for the approved local handoff; user approved implementation
  on 2026-09-29.
- Authorization: user invoked `grill-with-docs` to plan Husky, tests and other
  checks, using `fe-delgate-marketplace` as a reference for this Expo app.
- Outcome: a contributor can run one documented local quality command, gets a
  fast staged-file check before committing, and sees the same core checks run on
  GitHub pull requests without a live Convex deployment or production secrets.
- Owned files: `package.json`, `package-lock.json`, `.gitignore`, `.husky/`, staged-file check
  configuration, focused app test configuration and tests, a focused
  `convex/shifts.test.ts` regression, `.github/workflows/`,
  and the relevant verification instructions in `README.md`/`AGENTS.md` or its
  surviving workflow guide. A narrow app or `convex/shifts.ts` fix is allowed
  only if a new shift regression test exposes a defect in the selected behavior.
- Out of scope: changing financial or authorization policy, broad app refactors,
  blanket formatting, coverage targets copied from the marketplace, Playwright
  browser E2E, native device E2E, EAS builds/submissions, branch protection,
  Jira commit-message/branch rules, unrelated agent-workflow cleanup, commits,
  pushes and deployment. Do not edit the marketplace repository.
- Stop after: local implementation, executable checks, self-review and a
  reviewable handoff. CI can run remotely only after a separately authorized push.
- Assumptions / unresolved decisions: use GitHub Actions because this repository
  has a GitHub remote; start with one pull-request quality workflow. Use npm,
  Husky and staged-file ESLint checks without auto-fixing or staging user work.
  Keep the current Convex Vitest suite and add the Expo-supported Jest preset
  with React Native Testing Library for app interaction tests. No material
  product decision is unresolved for this first gate.

## Acceptance criteria

- [x] `npm ci` installs the test tooling; `npm run prepare` activates Husky
  locally, and `HUSKY=0 npm ci` installs in CI without activating Git hooks.
- [x] A staged TS/TSX/JS file with an ESLint error blocks a commit; a clean
  staged file passes. The hook does not mutate or stage unstaged user changes.
- [x] There is no new ticket, branch-name or commit-message restriction.
- [x] Existing Convex tests keep running through `npm run verify:backend`.
- [x] A Convex function test proves that a manager saving a revised roster for
  an existing shift date updates that shift rather than creating a second one;
  its result is visible through the protected query. Use synthetic staff data.
- [x] A dedicated app-test command runs a meaningful React Native interaction
  regression: a shift selection draft stays selected when its query refreshes.
  Keep tests outside Expo Router's `app/` route tree.
- [x] A single documented quality command runs full zero-warning app lint,
  app/Convex typechecks, backend lint and tests, and app tests. Failures return
  nonzero; no empty-test success flag or live backend is required.
- [x] A GitHub pull-request workflow is configured to run the Convex backend gate,
  app lint/tests and an iOS, Android and web Expo export with synthetic,
  non-secret configuration. A failing step prevents workflow success. Its first
  remote run awaits a separately authorized push.
- [x] Existing modified and untracked files remain intact; only task-owned
  files change. `git diff --check` passes.

## Implementation notes

The current branch has substantial uncommitted work. It already has 42 Convex
tests in three suites, a `verify:backend` script, zero-warning app lint and a
prior successful three-platform export. It has no Husky hooks, GitHub Actions
workflow or app component-test runner. `.gitignore` currently ignores the
entire `.github` directory, so add a narrow workflow exception. Preserve all existing changes and the
separate proposed agent-workflow cleanup task.

Reference checkout: `/Users/francispham/Work/Itshere/fe-delgate-marketplace`.
Its `prepare`/Husky/lint-staged setup, `test:run`, scoped verification ladder
and Jenkins quality stage provide patterns. Its Vite/Vitest DOM setup,
Playwright suite, 80% coverage thresholds, Jira commit convention and branch
validation are specific to that app. Do not transplant them.

Convex already has authorization, callback and password regression suites.
Keep its edge-runtime Vitest gate first-class in CI, and add one shift write/read
regression paired with the app's shift-selection interaction. Do not add an
arbitrary coverage percentage or repeat the existing role tests. Server-side
money invariants are a separate domain/policy task; this quality-gate setup
must not silently define those rules. `convex-test` is a simulated backend, so
passing tests do not establish real deployment, OAuth or concurrency behavior.

Use Expo's Jest preset and React Native Testing Library for the app test layer;
keep Convex's edge-runtime Vitest configuration separate. Follow the Expo Router
guidance to place tests outside `app/`. The initial pull-request workflow is a
local quality gate expressed as code; it neither publishes artifacts nor
enforces GitHub branch protection. Native compilation and device/auth flows
remain later checks.

## Executable evidence

Final local checks on 2026-09-29:

- `npm run test:backend -- convex/shifts.test.ts`: PASS, one new Convex test.
- `HUSKY=0 npm ci`: PASS; `npm run prepare`: PASS and Git hook path became
  `.husky/_`. The first sandboxed `prepare` could not lock `.git/config`, so the
  approved retry ran outside the sandbox. No repository commit was created.
- In an isolated temporary Git repository, `git hook run pre-commit` passed
  for a clean staged JS file and failed for a staged syntax error. An unstaged
  sentinel file stayed unchanged. The app repository's index was untouched.
- `CI=1 HUSKY=0 EXPO_NO_DOTENV=1 EXPO_PUBLIC_CONVEX_URL=https://example.convex.cloud
  npm run verify:quality`: PASS; both TypeScript projects, zero-warning backend
  and app lint, 43 Convex tests across four files, and one Jest app test.
- `npx eslint . --no-cache --max-warnings 0`: PASS.
- `CI=1 EXPO_NO_DOTENV=1 EXPO_PUBLIC_CONVEX_URL=https://example.convex.cloud
  npx expo export --platform all --output-dir /tmp/glosse-quality-export
  --max-workers 2`: PASS; iOS, Android and web bundles, 110 static routes.
- GitHub workflow YAML parsed with the expected pull-request trigger and six
  steps. Its commands passed locally; the workflow itself was not run on GitHub.
- Package-lock root versions/dependencies matched `package.json` after the
  install. `git diff --check`: PASS.

Install reported a peer warning for a nested `test-renderer` React reconciler
and 14 moderate npm audit findings. They did not fail `npm ci` or local checks;
dependency vulnerability remediation is outside this task.

## Review

Self-review: the only Convex source change is the new synthetic function test;
`convex/shifts.ts` behavior and authorization policy were untouched. The app
test mocks child presentation and Convex data but exercises the real earnings
screen's draft-selection and save logic. The hook invokes staged-file ESLint
without autofix. CI uses read-only repository permission and a synthetic
Convex URL; no deploy key, backend push, or EAS publish step is present. The
workflow commands match the documented local gates. No independent reviewer
was requested because this task did not change authorization, money or schema.

## Handoff

The approved local setup is complete. Husky, app and Convex tests, scripts,
documentation and the pull-request workflow are reviewable in the working
tree. No commit, push or deployment occurred. GitHub CI, native device flows,
browser interaction and live OAuth remain unverified until separately run.
