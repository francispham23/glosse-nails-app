# Task: Decimal keyboard for amount fields

## Contract

- Status: locally verified; device confirmation deferred
- Authorization: user requests fixing the missing decimal key on the iPhone web app; user approved the written contract with "go" on 2026-10-12.
- Outcome: amount fields request a decimal keyboard so iPhone web users can enter cents.
- Owned files: components/Form/numeric-input.tsx, components/Form/gift-card-inputs.tsx, app/(root)/(main)/gift/create.tsx, this task record.
- Out of scope: financial parsing/calculations, validation, backend, layout, dependencies, release.
- Stop after: local verification, self-review, and handoff; no commit, push, or deployment.
- Verification plan: typecheck and relevant existing app tests; npm run verify:quality; synthetic all-platform export per docs/agent-workflow.md; git diff --check. Inspect web input-mode mapping. Actual iPhone Safari keyboard confirmation must be separately recorded; desktop checks cannot establish physical keyboard appearance.
- Baseline: clean checkout at d61816c.
- Assumptions / unresolved decisions: amount fields should use decimal input; gift-card identifiers should retain numeric keyboards. No unresolved product decisions.

## Acceptance criteria

- [x] Earning amount fields (card/cash compensation, tips, discount and supply) request decimal input and preserve draft strings such as 12.50.
- [x] Gift-card value and redemption amount fields request decimal input.
- [x] Gift-card code fields retain numeric input, including the shared NumericInput consumer in gift/create.
- [x] Existing validation, financial calculations, styling and save behavior remain unchanged.
- [x] Relevant local checks and platform exports pass, or failures are explicitly reported.
- [ ] Actual iPhone Safari decimal-key appearance: deferred; no physical iPhone session available. Device confirmation remains required and is not established by local exports or server rendering.

## Implementation notes

The shared NumericInput and separate gift redemption amount field use keyboardType="numeric". Installed react-native-web maps numeric to HTML inputMode="numeric" and decimal-pad to inputMode="decimal". Plan: set decimal keyboard/input mode for amounts, with an explicit numeric option for the shared gift-card code consumer. React Native documentation confirms inputMode takes precedence over keyboardType: https://reactnative.dev/docs/textinput.

## Executable evidence

- npm run verify:quality: passed; both typechecks, backend and app lint, 115 backend tests, 147 app tests and 2 export guard tests.
- CI=1 EXPO_NO_DOTENV=1 EXPO_PUBLIC_CONVEX_URL=https://example.convex.cloud npx expo export --platform all --output-dir /tmp/glosse-decimal-keyboard-export --max-workers 2: passed for iOS, Android and web. Synthetic backend URL; no deployment.
- Node server-render check using installed react-native-web TextInput: decimal and numeric modes render the expected HTML input mode and retain synthetic values 12.50 and 00123. This verifies library mapping, not physical keyboard appearance or app interaction.
- git diff --check: passed.
- Acceptance evidence: all NumericInput callers traced; only gift creation code uses the numeric override. Separate redemption amount uses decimal; separate redemption code retains numeric. Value handlers and all financial logic unchanged. Existing financial form tests passed.
- No physical-device or live-backend runtime verification performed.

## Review

Self-review of the three-file source diff against d61816c: no findings. Reviewed final changes consist of 7 insertions and 2 deletions; this task record is also untracked. Confirmed all shared consumers and both gift-card identifier paths; no calculations, validation or save handlers changed. No independent reviewer used.

## Handoff

Implemented approved keyboard hints and passed local verification. Device acceptance remains deferred pending iPhone Safari confirmation after the change is available there. No commit, push or deployment performed; task remains locally verified rather than fully device-verified.
