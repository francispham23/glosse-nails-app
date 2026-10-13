# Task: Reuse NumericInput for gift redemption fields

## Contract

- Status: complete
- Authorization: user approved the proposed scoped refactor with "sure".
- Outcome: gift code and redemption amount reuse NumericInput while preserving appearance, draft strings and handlers.
- Owned files: components/Form/numeric-input.tsx, components/Form/gift-card-inputs.tsx, this record.
- Out of scope: financial logic, validation, backend, redesign, dependencies, commit/push/deployment.
- Stop after: executable checks, self-review and local handoff.
- Verification plan: verify:quality, synthetic all-platform export, git diff --check and source review of handlers and icon defaults.
- Baseline: d61816c with existing uncommitted decimal-keyboard edits in three source files and their task record; preserve all existing work.
- Assumptions / unresolved decisions: no unresolved decisions; retain Paper's 24px default icons in gift fields and existing 22px NumericInput defaults elsewhere.

## Acceptance criteria

- [x] Both gift fields reuse NumericInput; codes request numeric mode, amounts decimal mode.
- [x] Placeholders, handlers, styling, icon sizes/colors and financial logic remain unchanged.
- [x] Relevant completion checks pass; runtime limitations are recorded.

## Implementation notes

NumericInput accepts optional iconColor and an iconSize defaulting to 22. Gift fields specify size 24 and omit color to retain Paper's defaults. No handlers or calculations change.

## Executable evidence

- npm run verify:quality: passed both typechecks, backend/app lint, 115 backend tests, 147 app tests and 2 export guard tests.
- CI=1 EXPO_NO_DOTENV=1 EXPO_PUBLIC_CONVEX_URL=https://example.convex.cloud npx expo export --platform all --output-dir /tmp/glosse-numeric-reuse-export --max-workers 2: passed iOS, Android and web exports with synthetic configuration.
- git diff --check: passed.
- Source review: both fields use NumericInput with unchanged value/change handlers and placeholders; numeric code override and decimal amount default confirmed. Installed Paper constants define ICON_SIZE=24; shared default remains 22, and omitted color retains theme behavior.
- No live app/device runtime verification performed; these checks establish local test and bundle compatibility.

## Review

Self-review of the two owned source files against the pre-refactor working tree: no findings; financial helpers and handlers unchanged. Existing decimal-keyboard work and gift/create edits preserved. Reviewed files identified by SHA-256:
- numeric-input.tsx: bff930aad623be8e20860419be85ce9b770fd7d9c3d812175e1f2fc58572bc60
- gift-card-inputs.tsx: 1b68c0cc1a05201b51734263811dd845241f3877bdeab70287200cdb0ea09dd4
The new task record is also owned; no independent reviewer used.

## Handoff

Both gift redemption fields now reuse NumericInput. Local checks and exports passed. Physical-device keyboard appearance remains unverified, as recorded by the preceding decimal-keyboard task. No commit, push or deployment performed.
