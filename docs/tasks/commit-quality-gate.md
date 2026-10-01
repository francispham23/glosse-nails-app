# Task: Full local quality gate before commit

## Contract

- Status: complete; locally verified and self-reviewed.
- Authorization: user invoked grill-with-docs to ask whether tests, lint issues
  and bugs can be caught during git commit. User replied "Go" after the written
  plan, approving this implementation. Commit/push/deployment remain excluded.
- Outcome: a normal local commit runs all existing automated app/backend tests,
  both typechecks and full zero-warning lint, and aborts if any check fails.
- Owned files: .husky/pre-commit; package.json only if a small wrapper command is
  needed; README.md and docs/agent-workflow.md for the actual hook behavior;
  this task record. An isolated hook verification harness is allowed if needed.
- Out of scope: product fixes, new domain tests, dependencies/lockfile changes,
  adding exports/device/browser/live-backend checks to every commit, remote branch
  protection, AI review on every commit, commits/pushes/deployments and Git config
  changes. Preserve the existing PR quality/export workflow.
- Stop after: locally checked hook behavior and documented limits; no commit/push.
- Baseline: clean update-expo-57 at 25bfc31 before creating this task record.
  core.hooksPath is .husky/_. Existing pre-commit runs only npm run lint:staged.
  Its JS/TS-family pattern invokes eslint --max-warnings 0 on staged files.
- Assumptions: user wants every normal local commit to run the full existing
  suite, accepting additional commit latency. Keep staged lint first for quick
  feedback, followed by npm run verify:quality without automatic fixes.
  Exports stay in PR CI. No material product decision is unresolved.
- Verification plan: inspect hook/script alignment; isolated temporary Git repo
  exercises hook success and failure propagation without creating a commit;
  execute the real npm run verify:quality once; docs checker and git diff --check.

## Acceptance criteria

- [x] Normal pre-commit invokes staged ESLint first, then full quality checks.
  It also runs full quality checks for commits without staged JS/TS files.
- [x] A staged ESLint error or warning blocks the hook before later checks.
- [x] Backend/app test failure, either typecheck failure or full lint failure
  blocks the hook with a nonzero exit status. No failure is swallowed.
- [x] Clean checks let the hook succeed. No app/backend tests are skipped via
  changed-file selection or an empty-suite success flag.
- [x] No automatic fixing/staging occurs; partially staged and unstaged user
  contents and the app repository's index remain intact after success/failure.
- [x] Documentation says full checks execute against the working tree, which
  may differ from a partially staged commit. Passing them does not certify an
  arbitrary staged snapshot; PR CI checks the pushed commit in a fresh checkout.
- [x] Documentation states hooks can be bypassed (e.g. --no-verify/HUSKY=0),
  existing tests catch only covered regressions and static exports are not device,
  browser or live-backend testing. Local hooks do not enforce remote merge policy.
- [x] Real quality gate, isolated hook verification, docs checker, diff check and
  focused self-review pass, or failures are explicitly recorded and task stays open.

## Implementation notes

Current scripts already cover the requested automated surface:
verify:quality -> verify:backend (app/backend typechecks, backend lint, Vitest)
and verify:app (full zero-warning Expo ESLint, Jest app tests).
No test runner or dependency setup is needed. Run commands sequentially and
preserve nonzero status; do not place commands in a shell construct that hides errors.
Use the existing Husky entry point rather than changing global Git settings.

The prior quality task intentionally chose fast staged lint. This is a new,
bounded extension of that completed setup. Preserve its historical evidence.
No hook can guarantee detection of all bugs; stronger coverage or runtime
verification remains a separate approved task.

## Executable evidence

- `python3 /tmp/glosse-commit-hook-check.py`: passed 2 baseline and 8 updated
  hook scenarios using command doubles. The old hook succeeded even with a
  configured backend-test failure because it never invoked that gate. The new
  hook executes the actual package-script command chain and propagates simulated
  failures from staged lint, each typecheck, backend lint/tests and app lint/tests.
- The same harness ran real lint-staged/ESLint in an isolated local clone for
  5 cases: clean, syntax error, lint warning, docs-only and failure of the later
  quality command. Only clean/docs-only succeeded. No commit was created.
  Partially staged content, unstaged and untracked sentinels and staged trees
  stayed unchanged. The app repository's actual index bytes stayed unchanged.
  Real quality execution is established separately below; failure injection uses
  command doubles and does not claim new product regression coverage.
- Initial harness attempts failed: cleanup needed forced index removal for a
  disposable partially staged fixture; a repository without any initial history
  caused lint-staged to skip its stash backup and fail sentinel restoration.
  Corrected the fixture to clone existing local history without creating commits.
  Final scenarios exercise the same existing-history condition as this app.
- `npm run verify:quality`: passed both typechecks, backend/full zero-warning
  lint, 115 backend tests across 6 files and 59 app tests across 3 files.
- `node scripts/check-agent-docs.mjs`: passed 13 files, 39 local references and
  19 npm command references. `git diff --check` and shell syntax check passed.
- Exports/device/browser/live-backend checks were not rerun: no product bundle,
  dependency or runtime behavior changed, and these checks are outside this task.

Acceptance evidence: command order and failure scenarios establish items 1-4;
real staged-lint restoration and unchanged app index establish item 5;
README/workflow document items 6-7; complete checks and self-review establish item 8.

## Review

Focused self-review of .husky/pre-commit, README.md, docs/agent-workflow.md and
this task record at HEAD 25bfc31 plus the owned changes. Explicit set -e stops
on either command's failure, including when invoked through installed Husky's
sh -e entry point. Existing package scripts retain complete test discovery and
zero-warning lint. No auto-fix/staging flag, package/dependency change, bypass
condition or deployment step was added. No actionable issues remain.
Reviewed SHA-256 prefixes: hook be04d199896e, README 443369a1d8ec,
workflow 05e0b293e7fa. Only this evidence record changed after that review.

## Handoff

Every normal local commit now runs staged lint followed by the full quality
gate; failures abort the hook. This includes docs-only commits and adds the
duration of full lint/typechecks/tests to each commit. README/workflow explain
working-tree versus partial-commit limitations and bypass/coverage limits.

Only the hook and approved documentation changed. No product, dependency, Git
configuration or environment edits; no commit, push or deployment. User can now
stage and commit their intended changes with the active hook; PR CI remains the
check against the pushed commit and includes platform exports.
