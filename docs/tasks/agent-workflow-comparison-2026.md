# Task: Agent workflow comparison and improvement plan

## Contract

- Status: phase 1 complete locally; analysis complete.
- Authorization: user explicitly invoked grill-with-docs to compare Glossé with
  fe-delgate-marketplace and current 2026 practices; then approved phase 1 with "Go".
- Outcome: repository-grounded comparison and one portable implementation/review
  path with accurate documentation and visible approved financial rules.
- Owned files: this record; AGENTS.md, README.md, docs/agent-workflow.md,
  docs/financial-policy.md, docs/tasks/template.md, .gitignore;
  .agents/skills/glosse-task/** and the three Cursor compatibility entry points;
  scripts/check-agent-docs.mjs.
- Out of scope: unrelated workflow/rule edits, dependency installation, hooks, environment
  changes, reference-repository edits, product behavior, commits/push/deployment.
- Stop after: locally validated and reviewed phase 1 documentation/skills.
- Snapshot: 2026-09-30; Glossé HEAD fc58d93 plus the reviewed calculation work.
  Reference checkout: /Users/francispham/Work/Itshere/fe-delgate-marketplace.
- Assumption: support the present Codex workflow while preserving Cursor
  compatibility. No approval to delete existing Cursor/Claude assets is inferred.

## Executive assessment

Glossé already has the most valuable foundation: a concise AGENTS.md,
one contract per task, explicit implementation approval, targeted checks,
independent review for money/auth/migrations, preserved work and a local
handoff boundary. Its GitHub PR gate includes TypeScript, lint, backend/app
tests and iOS/Android/web exports. The biggest next improvements are executable
financial invariants, device/browser evidence and reliable skill discovery.

Marketplace is a useful reference for verification artifacts, scope controls
and review feedback. Its exact recipes assume a different product, runtime,
design pipeline and ticketing system. Copying its whole .cursor directory would
introduce irrelevant commands, dependencies and approval gates.

## 1. Verified repository comparison

### Glossé

- Expo SDK57, React Native0.86, React19, Expo Router, Uniwind, React Native Paper,
  Convex/Convex Auth, Zod; npm.
- Frontend interaction tests use Jest/jest-expo and React Native Testing Library.
  Backend tests use Vitest/convex-test; these are two intentional runners.
- Tracked workflow entry points: AGENTS.md, docs/agent-workflow.md,
  .agents/skills/grill-with-docs, .cursor/skills/glosse-task, two .cursor agent
  definitions, one small Cursor rule and CLAUDE.md.
- 23 local .agents SKILL.md files were present. Only grill-with-docs is tracked;
  the other installed Expo/Convex skills and skills-lock.json are ignored.
  A new clone cannot reconstruct that exact local catalog from Git alone.
- Existing GitHub quality workflow performs backend/app gates and platform exports.
  No .maestro flows, .eas workflow files or Playwright configuration were found
  in the checked repository paths. Device/E2E coverage is not established.
- The approved calculation task now passes 62 backend and43 app tests plus
  three-platform exports. Those checks establish local correctness for the
  fixtures, not live OAuth, device UX, concurrency or release safety.

### Marketplace

- React19/Vite, TanStack Router/Query, generated OpenAPI client, Zustand,
  React Hook Form/Yup, browser Tailwind, pnpm.
- .cursor contains21 skills,53 .mdc rule files and two hook scripts, based on
  the checked inventory. No .cursor/agents directory was present.
- Workflow centers on DELC Jira tickets, Cursor Plan/Build, pinned Figma
  nodes/routes, gate.md/grill.md/design-context artifacts and serial subtask
  chats. Several recipes depend on a sibling knowledge-base checkout.
- Verification includes typecheck/scoped Vitest, full tests, lint, browser
  Playwright and Storybook support; visual verification captures Figma/live
  screenshots with numeric/pixel evidence and a report validator.
- Hooks run ESLint autofix after edits and guard selected push/PR commands.
  The guard is branch/ticket dependent and permits work when no matching gate
  exists; it is not a universal authorization or CI mechanism.

Evidence: both package.json files; Glossé AGENTS.md, README.md, .gitignore,
docs/agent-workflow.md, .github/workflows/quality.yml, jest.config.js and eas.json;
Marketplace .cursor/WORKFLOW.md, hooks.json, implement-ticket, verify-changes,
visual-verify, pr-pre-flight and testing/unit-testing.rule.mdc.

## 2. Transfer, adapt and defer

### Transfer the principles

1. **Explicit completion artifacts.** Every task records changed scope, exact
   commands/results, reviewer findings, repairs and unexecuted checks.
2. **Verification ladder.** Targeted tests while implementing, full quality gate
   at the completion boundary, exports for product changes. Changed-file mapping
   should include callers and shared helpers, not merely the edited file.
3. **Test behavior.** Assert explicit expected amounts and user-visible effects.
   Mock transport/router/native presentation where necessary, not the arithmetic
   being protected. Use direct Convex API tests for permissions and persistence.
4. **Independent evaluation.** A reviewer checks the actual current diff and
   reproducing fixtures. Review completion must identify the exact reviewed
   state, especially if implementation changes during the review.
5. **Promote proven corrections.** A repeated mistake first becomes a regression
   test; durable repository-specific guidance follows when it helps future work.
   Update existing guidance before adding another rule.

### Adapt to Glossé's stack

- create-unit-tests → separate native consumer/Jest patterns from Convex API/
  Vitest patterns; preserve existing test discovery paths. Do not copy DOM
  queries, jest-dom, userEvent or Marketplace colocation rules blindly.
- create-form-schema → retain Zod/current form state; share domain validation
  with mutations where appropriate. Replacing forms with RHF/Yup is a separate
  product/architecture decision.
- create-api-hook → use typed Convex generated references and native reactive
  query/mutation behavior. Add a wrapper only for repeated domain behavior;
  avoid adding React Query/OpenAPI just to match the reference.
- create-zustand-store → evaluate actual local-state needs; current contexts and
  hooks remain suitable without introducing Zustand.
- visual-verify → record platform, device/viewport, theme, data state and
  expected result. Native safe areas, keyboard, gestures, deep links and date
  pickers need runtime evidence; browser screenshots cannot establish these.
  Pin Figma when implementing a supplied design; do not block a financial fix
  because no Figma frame exists.
- pr-pre-flight → auth/ownership, money invariants, fixture results,
  generated-file preservation, platform evidence and release boundary.
  Marketplace typography/i18n/external-label requirements are product-specific.
- self-improvement → propose reviewed changes to repo tests/docs/rules. No
  automatic edits to global memory, user preferences or another repository.

### Defer until a concrete need

App Clips, brownfield embedding, custom native modules, Convex component
extraction, native SwiftUI/Compose or a Storybook rollout do not improve this
workflow simply by being available. Likewise a hard80% coverage target can
miss money defects while encouraging low-value tests; prioritize critical
behavior and branch/edge cases first.

## 3. Specific improvement opportunities

### Highest priority: make financial contracts explicit and executable

docs/access-policy.md is detailed for authorization, but a matching financial
contract is missing. The new tests exposed payroll ties, gift-tax disagreements
and persistence/preview mismatches. Document the approved rules in a compact
docs/financial-policy.md with examples and test pointers:

- earnings versus payroll; historical pay-rate snapshots and legacy fallback;
- included/excluded tip methods; supply allocation; fixed/percentage discounts;
- normalization and rounding stage; combined taxed gift usage and untaxed tips;
- create/edit/delete/reassignment effects; date/timezone boundaries;
- finite/nonnegative inputs, accepted precision, split limits and gift availability.

Some of these are confirmed behavior; some require product decisions. Label
the distinction. This document must not silently define new tax/payroll policy.

Backend mutations currently accept monetary strings and parse them; shape
validation is not a complete domain invariant. Plan separate server-side
financial validation and tests for invalid numbers, negative amounts, unsupported
methods, invalid splits and insufficient gift balances. Enforce a gift cap in
the same mutation that records redemption, not only a UI quote. Convex's
transaction/OCC model is relevant to concurrent redemptions, but simulated tests
do not establish real contention behavior. This is a product task requiring its
own approved contract; no such enforcement was added by this comparison.

Primary references:
[Convex validation](https://docs.convex.dev/functions/validation),
[OCC/atomicity](https://docs.convex.dev/database/advanced/occ),
[convex-test](https://docs.convex.dev/testing/convex-test).

### High priority: skill portability and reproducibility

Move the canonical implementation/review recipe into portable .agents skills
while keeping thin Cursor compatibility references. Retain AGENTS.md as a small
map to workflow/domain guidance. Agent Markdown definitions are prompts, not
automatically running agents; verify tool discovery/invocation rather than
assuming folder placement creates runtime behavior.

Record approved skill sources/revisions and a reproducible bootstrap procedure.
Do not commit every downloaded vendor file or load every skill in every task.
Check overlapping project-local/vendor skills for contradictory scope, commands
and release instructions. Repository/user authorization must govern deployments
even if a downloaded recipe suggests a push.

The pending openai-agent-workflow-cleanup.md is an unapproved proposal. Keep its
history; do not perform its deletions as an implied part of this analysis.

### High priority: close the runtime verification gap

Keep the present fast PR gate. Add a small synthetic runtime suite:

1. active/inactive/unapproved sign-in and access;
2. create/edit mixed payment transaction and inspect earnings/payroll;
3. redeem/edit/switch/delete gift usage and inspect balance;
4. shift selection persistence;
5. web refresh/deep links and native keyboard/date-picker interactions.

Use Maestro for deterministic iOS/Android release smoke tests, Playwright for
browser flows, and evaluate Callstack agent-device for agent-operated
exploratory verification. The official Expo guide documents agent-device with
screenshots, UI state and logs and links its skill; start on a simulator with
synthetic data. These serve different purposes and need not all be installed
in phase1. Artifact evidence should identify app build, platform, backend target,
fixture, expected/observed result and failures.

Sources:
[Expo Maestro workflow guide](https://docs.expo.dev/eas/workflows/examples/e2e-tests/),
[agent-device/Expo](https://docs.expo.dev/agents/agent-device/),
[Expo native unit testing](https://docs.expo.dev/develop/unit-testing/).

### Medium priority: release and observation contract

Separate locally verified, preview verified and production released states.
For an authorized release record binary/update identity, backend compatibility,
monitoring signals, rollback path and native-library changes. Review OTA runtime
compatibility and rollout only when OTA is actually configured.

expo-observe and eas-update-insights are locally available skills; package.json
does not show expo-observe installed. A skill is not monitoring instrumentation.
Evaluate monitoring based on a concrete operational question, not an assumed
dashboard. Inspect Convex performance when measured signals or unbounded paths
justify it; avoid premature digest tables or schema redesign.

Sources:
[EAS Observe setup](https://docs.expo.dev/eas/observe/get-started/),
[EAS Update rollouts](https://docs.expo.dev/eas-update/rollouts/).

### Medium priority: documentation and check integrity

README lists Biome as the linter while npm/CI/staged checks use ESLint, and calls
Expo Router v6 although package.json pins57.x. Correct these facts when workflow
documentation changes are approved. Treat manifests/commands as authoritative
evidence. Add a small link/command check for canonical workflow references and
test recipe examples; full schema machinery for every task is unnecessary.

The calculation record retained an initial unchecked checklist while appending
final evidence. Future task completion should update each acceptance item or
explicitly defer it, rather than making readers infer completion from an appendix.

## 4. What current 2026 guidance supports

OpenAI's February11 harness engineering report emphasizes concise repository
instructions that point to maintained knowledge, executable architectural checks
and observable environments. For Glossé this means financial/access docs,
tests and runtime evidence, rather than a larger global prompt.
[OpenAI](https://openai.com/index/harness-engineering/).

Anthropic's March24 experiment supports explicit sprint contracts and separate
generator/evaluator responsibilities, while showing that some scaffolding was
removed as models improved. Treat these as reported experiments, not a universal
mandate for more agents or fresh chats after every step. Glossé should use one
writer and a focused reviewer for high-risk changes, with bounded repair loops.
[Anthropic](https://www.anthropic.com/engineering/harness-design-long-running-apps).

Agent Skills supports progressive disclosure: small metadata for discovery,
instructions/references when relevant. A named skill should say when to use it,
what it owns and how to verify it. Keep reusable procedures portable and project
policy in the repo.
[Agent Skills specification](https://agentskills.io/specification).

Expo now documents its official skill catalog and agent-device verification.
Use those supported domain recipes rather than adapting browser-only Vite
instructions to native code.
[Expo skills](https://docs.expo.dev/skills/).

None of these sources proves that the Marketplace's exact approval ladder,
model selection or hook behavior is optimal for this app.

## 5. Approved first implementation contract

Outcome: agents reliably discover one portable Glossé implementation/review path
and select the existing checks correctly, with approved financial rules visible.

Scope:

- AGENTS.md and README factual/path corrections;
- portable .agents/skills/glosse-task plus a concise reusable review reference;
- thin .cursor compatibility references; no vendor directory deletion;
- docs/financial-policy.md for already approved rules and clearly unresolved items;
- task template acceptance/evidence fields and a small documentation/reference check;
- .gitignore adjustments only for owned portable skill files.

Acceptance:

- [x] Existing explicit approval, one-writer, synthetic-data and release boundaries remain: canonical skill, workflow and AGENTS retain them.
- [x] Portable workflow works without .cursor execution assumptions: canonical skill/review reference link directly to repo docs; Cursor entries are compatibility references.
- [x] Every checked workflow reference resolves; example npm scripts match package scripts: read-only checker passes 13 files, 35 local links and 17 command references.
- [x] Financial examples point at the approved regression tests; no new policy is invented: financial document distinguishes approved rounding, characterization and unresolved decisions.
- [x] Both Codex and Cursor entry points resolve to the same canonical guidance: AGENTS, README and the three Cursor wrappers point to the portable files.
- [x] Existing calculation/product diff is preserved; no dependencies/env/hooks changed: all nine calculation source/test SHA-1 fingerprints match the pre-edit baseline.

Verify: skill metadata/reference validation, command/reference scan, git diff --check
and focused review of documentation/skills. Product gates need not rerun merely for
Markdown edits unless an executable verification script/config is changed.

Stop after: locally reviewed workflow/documentation changes. No installation,
runtime test environment, release automation, schema migration, commit or push.

Later separately approved phases: backend financial invariants; synthetic
Maestro/Playwright/device harness; preview/release/monitoring procedure.

## Phase 1 executable evidence

- Read-only `node scripts/check-agent-docs.mjs`: PASS; 13 files, 35 local
  links and 17 npm command references. It checks canonical/compatibility documents,
  not every historical task or external URL.
- Isolated temporary fixture probes: unchanged documents PASS; adding a broken
  local link and unknown npm script makes the checker exit 1 with both errors.
  Fixture deleted; no repository document was mutated by the probe.
- Installed js-yaml parser plus metadata/UI assertions: PASS for both portable
  skills. Required name/description, supported fields, UI prompt/name consistency,
  short-description limits and preserved explicit invocation policy checked.
- Bundled `quick_validate.py`: unable to run under system or bundled Python
  because PyYAML is absent. No dependency installed; the YAML assertions above
  are an alternative check, not a claim that the bundled validator ran.
- `eslint scripts/check-agent-docs.mjs --max-warnings 0`: PASS.
- `git diff --check`: PASS.
- Product tests/exports not rerun for phase 1: product files, tests, manifests,
  runner configuration and generated files are unchanged from the already
  verified calculation baseline (62 backend/43 app tests and all-platform exports).

## Review and handoff

The analysis was self-reviewed against the actual checkouts and primary sources.
Independent phase 1 review and skill forward-test by calculation_review found
no actionable issues. Reviewed fingerprints: canonical skill b15c912140b9,
review reference ca99b221d6ef, financial policy 37730a5a0cf0 and workflow
c3937959588a. Those sources remained frozen throughout review.

Forward test A (continue an approved rounding task): reuse approval/contract,
inspect actual state and relevant policy, complete the required app/quality/export
checks and independent money review; backend success alone is insufficient.
Record device/live limitations and permit local completion only when the contract
allows it. Forward test B (approved README typo): scoped documentation edit,
reference checker/diff/focused review and evidence; no unnecessary product gate
or renewed implementation approval.

Phase 1 delivered portable implementation/review guidance, compatibility
references, financial documentation, template/evidence improvements and the
read-only checker. All phase 1 acceptance items above are satisfied. Reference
repo left untouched; prior calculation work preserved. No commit, push,
installation or deployment. Next proposed product task is backend financial
invariants, requiring its own approved behavior contract.
