# Task: Staged TypeScript module lint

## Contract

- Status: complete
- Authorization: user requested lint fixes and supplied the failing staged-file hook.
- Outcome: staged TypeScript module files receive the same lint rules as TS files.
- Owned files: `eslint.config.js`, this task record.
- Out of scope: dependencies, commits, staging user files, application behavior.
- Stop after: locally verified fix and handoff.

## Acceptance criteria

- Staged `.mts` and `.cts` files use Expo's TypeScript lint configuration.
- The staged source file check passes with zero warnings.
- Full repository lint continues to pass.

## Implementation notes

Expo's TypeScript config matches `.ts` and `.tsx` but the staged-file glob also
includes `.mts` and `.cts`. Extend that config's file patterns to cover both.

## Executable evidence

- Before fix: ESLint on the staged source files failed with one ignored-file
  warning for `vitest.config.mts` and no source errors.
- After fix: the same staged-source ESLint invocation passed with zero warnings.
- Full repository `eslint . --no-cache --max-warnings 0` passed.

## Review

Self-review: retain all existing Expo rules and add only TypeScript module patterns.

## Handoff

Locally verified. Stage the updated ESLint config with the intended commit;
the existing Git index was preserved. No commit was created.
