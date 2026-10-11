# Task: Load Expo web types in clean-checkout typechecks

## Contract

- Status: complete
- Authorization: user requested a fix for the failing job described in the shared Copilot conversation and approved this contract with "go".
- Outcome: local and clean-checkout typechecks resolve Expo's web style types consistently.
- Owned files: `tsconfig.json`, this task record.
- Out of scope: product styling/behavior, dependencies, generated files, environment files, backend changes, CI redesign.
- Stop after: executable checks, self-review and local handoff; no commit, push or deployment.
- Verification plan: repeat TypeScript compiler check excluding ignored `expo-env.d.ts`; run `npm run verify:quality` and `git diff --check`. No platform export required for a type-loading-only change with no bundle behavior change.
- Baseline: clean working tree at `7b5c3c8`. `npm run typecheck` passes with local generated Expo declarations. Compiler API check excluding `expo-env.d.ts` reproduces exactly one TS2769 diagnostic at `components/workspace/web-route-shell.web.tsx:117` for `position: "fixed"`.
- Assumptions / unresolved decisions: explicitly load `expo/types` via the app tsconfig's `compilerOptions.types`; preserve the overlay's existing positioning. No unresolved product decision.

## Acceptance criteria

- [x] Without ignored `expo-env.d.ts` and `.expo/` declarations, app typechecking succeeds with zero diagnostics, accepting the web overlay's fixed positioning.
- [x] Normal app/backend typechecks and the repository quality gate pass; see executable evidence.
- [x] No product behavior, generated declarations, environment values or dependencies change. Git status/diff show only `tsconfig.json` and this task record.

## Implementation notes

The shared conversation identifies job 114521316526 and proposes `any` casts for the overlay. Repository investigation establishes a missing type-loading dependency instead: `expo-env.d.ts` references `expo/types`, which imports `react-native-web` augmentations. Expo's installed augmentation includes fixed positioning. `compilerOptions.types` is currently empty. The proposed fix explicitly loads the existing Expo type entrypoint, avoiding a cast and making clean checkout checks independent of generated declarations.

## Executable evidence

- `npm run typecheck`: passed locally on the unchanged baseline.
- TypeScript compiler API using parsed tsconfig roots minus `expo-env.d.ts`: one TS2769 error, matching the shared conversation. No source or generated files were modified to reproduce it.
- After fix, TypeScript compiler API using parsed tsconfig roots minus both `expo-env.d.ts` and `.expo/` declarations: passed with zero diagnostics (exit 0).
- `npm run verify:quality`: passed (exit 0), including app/backend typechecks, backend lint, 115 backend tests across 6 files, app lint with zero warnings, 147 app tests across 17 suites, and 2 export-script tests.
- `git diff --check`: passed. Platform exports/browser/native runtime checks were not run because the change only loads compiler declarations and has no bundle behavior effect. GitHub CI was not rerun remotely.

## Review

Self-review of the working tree based on `7b5c3c8`: the sole configuration diff is `compilerOptions.types` changing from `[]` to `["expo/types"]`; the accompanying untracked task record documents scope and evidence. Verified that the installed Expo entrypoint imports the web augmentation accepting fixed positioning. The no-generated-declarations compiler result confirms the fix does not depend on local Expo-generated files. No findings.

## Handoff

Explicit Expo type loading removes the clean-checkout TypeScript failure while preserving the modal's existing code and behavior. All acceptance criteria satisfied locally. No commit, push, deployment or remote CI run performed; stop at local handoff. Remote CI confirmation requires a separately authorized push/run.
