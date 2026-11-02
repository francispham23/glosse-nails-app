# Agent workflow

Use **one bounded task → explicit acceptance criteria → implementation → executable checks → review → handoff**.

## Task contract

Create one record from [the template](tasks/template.md) for a coherent change.
Include user authorization, outcome, owned files, explicit exclusions, acceptance
examples, checks and the stopping point. A task can span sessions; resume from
its record after checking actual git/files. Do not mix a security patch with a
schema migration, UI redesign or broad dependency upgrade.

For new or materially ambiguous work, invoke `grill-with-docs`. It reads only
the relevant repository documentation, investigates facts before asking the
user, writes or updates the task record, and presents one compact approval gate.
After approval, continue through `glosse-task`; do not repeat the approved
questions or add another implementation-approval gate.

The primary agent owns scope and handoff. The canonical
[glosse-task skill](../.agents/skills/glosse-task/SKILL.md) executes the approved
contract; [review guidance](../.agents/skills/glosse-task/references/review.md)
supplies a read-only review prompt. Cursor entries reference those same files.
Definitions are instructions, not running services or permission boundaries;
use available delegation tools only when authorized, otherwise label self-review.

## Acceptance and implementation

- Express criteria as observable behavior, including allowed and denied cases.
- For backend authorization, read [access policy](access-policy.md) and test
  direct function calls; UI route guards do not establish API security. For
  money changes read [financial policy](financial-policy.md) and test domain
  invariants with explicit expected amounts.
- Use synthetic fixtures and isolated tests. Avoid production credentials/data.
- Establish a failing security regression, implement the narrow fix, then prove
  the regression passes. Do not mock the authorization code being tested.
- Preserve existing APIs unless the contract explicitly requires a change.
- Keep instructions small; load framework/domain guidance only when needed.

## Executable checks

Commands are installed by phase 1's test setup:

```sh
npm run test:backend -- convex/authorization.test.ts
npm run typecheck
npm run verify:backend
npm run lint
npm run test:app
npm run verify:quality
git diff --check
```

Choose checks for the affected behavior and its callers:

- Backend/domain iteration: `npm run test:backend -- convex/calculations.test.ts`
  (or the relevant authorization/shift test).
- Native consumer iteration: `npm run test:app -- __tests__/financial-calculations.test.tsx`.
  App tests use Jest/jest-expo and React Native Testing Library; backend tests
  use Vitest/convex-test. Preserve their configured discovery paths.
- Product completion: `npm run verify:quality` and `git diff --check`.
- Product bundle changes: the existing CI export command, with synthetic configuration:

```sh
CI=1 EXPO_NO_DOTENV=1 EXPO_PUBLIC_CONVEX_URL=https://example.convex.cloud npx expo export --platform all --output-dir /tmp/glosse-quality-export --max-workers 2
```

- Workflow/documentation changes: `node scripts/check-agent-docs.mjs`,
  `git diff --check` and focused review. For skill edits also validate skill
  metadata with the available skill validator. Lint a changed executable checker;
  rerun product gates only when product/configuration changes justify them.

`verify:backend` runs typecheck, backend lint and the backend test suite.
`verify:quality` adds full app lint and app interaction tests. The pull-request
workflow also exports iOS, Android and web bundles. Run targeted tests during
iteration and the applicable full gate before handoff. Record existing
failures separately; an unrelated failure remains a failure, not a green gate.
Run platform smoke tests for changed user journeys, and Expo compatibility checks
for dependency/native configuration changes. No empty-test success option.

Tests use `convex-test` in the edge runtime; this is an in-process simulation,
not evidence of real deployment, OAuth redirects or concurrency behavior.
Do not run `convex dev`, deploy or schema migration as a supposedly read-only check.
Use an explicitly authorized isolated deployment for integration validation.

Before each normal local commit, Husky runs `npm run lint:staged`, then
`npm run verify:quality`. Either failure blocks the commit, including zero-warning
lint, either typecheck and all existing app/backend tests. There is no automatic
fixing or staging. Full checks use the working tree, so unstaged changes can affect
results for a partially staged commit. Hooks can be bypassed (`--no-verify` or
`HUSKY=0`); they do not enforce remote merge policy or detect every bug. PR CI checks
the pushed commit in a fresh checkout and retains all-platform exports.

## Review and repair

For authorization, money and migrations, use a separate reviewer when available
and delegation is authorized. Give it the contract, diff and test commands.
While it reviews, the primary agent may work on handoff documentation, not mutate
the reviewed source. Identify reviewed files and revision/working-tree fingerprint.
Re-review material fixes. Label self-review when a separate
reviewer cannot run. Never claim an unavailable reviewer passed the change.

Local rules and hooks are advisory. GitHub Actions now runs the pull-request
quality workflow; protected merge checks still require repository configuration.
Avoid automatic retry/stop hooks that cannot distinguish progress from a loop.

Default to serial implementation. Parallel work needs disjoint ownership,
isolated worktrees/test data and one integration owner; schema and authorization
changes stay serialized. Set task/time budgets before long unattended work.

## Handoff and learning

Record what changed, exact command results, review/fixes, outstanding risks and
the next authorized step. Update every acceptance item with evidence or an
explicit deferral; a partial task remains partial. Distinguish local verification,
preview/runtime verification and production release. Runtime evidence identifies
platform, build, synthetic fixture, backend target and expected/observed result;
do not copy credentials or production records. Do not commit, push, migrate or deploy automatically.
Preserve useful repeated corrections as a focused rule or regression test after
review; do not copy task-specific details into always-on instructions.
Measure task lead time, review rework, escaped defects and cost per accepted
change before expanding agent automation.

## Sources and local precedent

- Local reference: `fe-delgate-marketplace/.cursor/WORKFLOW.md`, particularly
  the Scope / Out of scope / Verify / Stop after contract and verification ladder.
- [Anthropic harness research, March 2026](https://www.anthropic.com/engineering/harness-design-long-running-apps):
  bounded work, explicit evaluation and structured handoffs. The proposed workflow
  adapts these principles; it does not assume more agents always improve outcomes.
- [Convex testing](https://docs.convex.dev/testing/convex-test): function-level
  regression testing with synthetic identities and data.
