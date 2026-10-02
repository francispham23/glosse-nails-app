# Task: Staged lint ignored files

## Contract

- Status: complete
- Authorization: User requested "fix it" after the exact flag change was proposed.
- Outcome: Intentionally ignored generated files do not fail staged lint.
- Owned files: package.json; this task record.
- Out of scope: Generated files, dependencies, product code, other staged work.
- Stop after: Local verification and self-review; no staging, commit, push or deployment.
- Verification plan: Reproduce original failure; run updated staged lint, prove source warnings still fail, check agent docs and diff whitespace.
- Baseline: HEAD 762b898; existing staged generated API change and two task documents preserved.
- Assumptions / unresolved decisions: None.

## Acceptance criteria

- [x] An explicitly supplied ignored generated file succeeds without an ignored-file warning: updated ESLint command exited 0.
- [x] Warnings in checked source files still fail under --max-warnings 0: synthetic unused-variable stdin probe exited 1.

## Implementation notes

Add --no-warn-ignored to the lint-staged ESLint command. Preserve ESLint ignore rules and the zero-warning threshold.

## Executable evidence

- Original command against convex/_generated/api.d.ts: exit 1, ignored-file warning exceeded zero-warning threshold.
- Updated command against the same generated file: exit 0.
- Synthetic TypeScript stdin probe: unused-variable warning, exit 1 as expected.
- Agent documentation checker passed (13 files, 39 links, 19 command references); git diff --check passed.
- npm run lint:staged could not run tasks because the sandbox forbids creating .git/index.lock. Direct ESLint verification establishes the changed command behavior; an actual commit-hook run remains unverified.

## Review

Self-review of working-tree package.json change against HEAD 762b898 and this task record: only --no-warn-ignored added; source warning enforcement and ignore rules preserved. Existing staged files remain unchanged.

## Handoff

Focused checks passed. Full product checks are not required for this lint-command-only change; the commit hook still runs verify:quality separately. Actual hook execution is deferred to the user's commit because of sandbox Git restrictions. No staging, commit, push or deployment performed.
