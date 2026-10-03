# Task: Current full lint audit

## Contract

- Status: complete (planning investigation; no source repair required)
- Authorization: User explicitly invoked grill-with-docs to fix all lint issues. Read-only diagnosis and this task record are authorized; source implementation requires an approved concrete plan if a failure is reproduced.
- Outcome: Identify current app/backend/repository lint failures and scope necessary fixes. All three current lint checks returned zero errors and warnings; no repair is presently supported by evidence.
- Owned files: `docs/tasks/lint-audit-2026-10-02.md` only during planning. No source/config/dependency change proposed without a reproduced diagnostic.
- Out of scope: Existing skills/verifier changes, inactive-account pilot implementation, rule suppression, generated/vendor files, formatting-only rewrites, dependency changes, Git staging/commit/push, deployments and runtime mutations.
- Stop after: Current lint diagnostics, scope determination, documentation check and handoff. Do not manufacture source changes or reopen the historical completed lint-cleanup task.
- Verification plan: Run uncached app lint with zero warnings, backend lint, and full repository ESLint using existing configuration; inspect staged-hook configuration and current Git state. If subsequent diagnostics justify product fixes, prepare their bounded owned-file contract, then require quality checks and relevant platform exports after approval.
- Baseline: `update-expo-57`, HEAD `a38492dacc2555bea801240ce89b89bfd9f95653`. Existing five tracked modifications and stage1/stage2 untracked files preserved. No staged paths at audit time.
- Assumptions / unresolved decisions: Scope is this Expo/Convex repository. Editor diagnostics, a different checkout, stricter external configuration or commit-hook failures have not been supplied and cannot be inferred from clean repository checks.

## Acceptance criteria

- [x] App lint returns zero errors/warnings without a cache.
- [x] Backend lint returns zero errors/warnings.
- [x] Repository-wide configured ESLint returns zero errors/warnings, including the retained executable helpers.
- [x] Existing work and generated files remain unchanged by this audit; no rules suppressed or auto-fixes run.
- [x] Findings distinguish executable lint success from app/runtime/release verification.

## Implementation notes

Read AGENTS.md, the current workflow/template and explicitly invoked planning
skill, package scripts, ESLint configuration, pre-commit hook and historical
lint-cleanup task. The old cleanup record is historical; fresh checks establish
the current result. Full repository ESLint uses existing deliberate generated,
agent tooling, build-output and cache exclusions.

The lint-staged command already uses `--max-warnings 0 --no-warn-ignored`, consistent
with the earlier ignored-generated-file repair. No staged files exist, so an
actual nonempty pre-commit hook was not exercised; no hook pass is claimed.

No implementation or additional approval gate is needed for a nonexistent source
repair. If an editor/hook diagnostic is supplied later, reproduce it and present
its concrete plan before editing source under this explicitly invoked skill.

## Executable evidence

Executed on 2026-10-02:

- `EXPO_NO_DOTENV=1 npm run lint -- --no-cache --max-warnings 0`: exit0, no diagnostics.
- `npm run lint:backend`: exit0, no diagnostics.
- `node_modules/.bin/eslint . --no-cache --max-warnings 0`: exit0, no diagnostics.
- `git diff --check`: passed.
- `node scripts/check-agent-docs.mjs`: passed,13 files/53 local links/19 npm references.
- Git status and staged-file inventory inspected; no source/config changes made.

Quality tests, typechecks, exports and live UI/backend checks were not rerun for
this documentation-only audit. Their earlier successes are not new execution
evidence. Lint success establishes configured lint cleanliness only.

## Review

Planning self-review: checked full configured lint coverage rather than relying
on the app command alone, preserved prior changes, avoided suppressing rules or
inventing fixes, and distinguished actual lint results from unexecuted hooks and
runtime behavior. No independent review or product repair claimed.

## Handoff

Current configured lint is clean across app, backend and full repository. Only
this audit record was created. No source fix, commit, push or deployment performed.
Any newly supplied diagnostic requires reproduction and a scoped repair plan.
