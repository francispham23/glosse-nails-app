# Task: Critical calculation regression tests

## Contract

- Status: complete locally; independently reviewed and verified.
- Authorization: user invoked `grill-with-docs` to plan tests protecting manually
  tested financial features on `update-expo-57`.
- Outcome: deterministic regression tests fail when agreed earnings, payroll,
  payment splits, reports or gift-card results change.
- Owned files: `utils/money.ts`, payroll aggregation in `convex/users.ts`,
  gift balances in `convex/giftCards.ts`, consistent total/payment cent
  normalization in `convex/transactions.ts`, gift form/history/report consumers,
  new tests under `__tests__/` and `convex/`; minimal test configuration
  changes if needed; this task record. Minimal extraction of existing frontend
  calculations into pure helpers is allowed only if testing the real component
  is impractical, with callers updated and behavior preserved.
- Scope: existing calculation behavior and create/edit/delete effects. Exercise
  real Convex functions and real frontend calculations; mock only external
  boundaries and presentation irrelevant to the assertion.
- Out of scope: financial policy beyond the approved rounding rules, server-side money enforcement, currency
  storage migrations, broad refactors, dependencies, authorization changes,
  production data, native/browser E2E, commits, pushes and deployment.
- Verify: targeted Jest and Convex tests during implementation; then
  `npm run verify:quality` and `git diff --check`. If product helpers/callers are
  extracted, also export iOS/Android/web using synthetic configuration.
- Stop after: verified local tests, review and a handoff listing uncovered
  discrepancies and untested device/live-backend behavior.
- Default discrepancy handling: report existing inconsistencies and obtain an
  agreed expected result before changing calculations. Do not make a test pass
  by copying the implementation's arithmetic or silently adopting a suspected bug.
- Decision: user approved half-up payroll rounding and consistent gift rounding
  ("Sure" after the proposed fix). Payroll rounds once after aggregation.
  Each gift redemption rounds the combined service/supply at 5% once, then adds
  untaxed tip. Balances subtract the sum of those rounded redemptions in cents.
  Existing supply allocation is preserved.

## Acceptance criteria

- [ ] Expected amounts are explicit, hand-calculated fixture values; tests do
  not call the implementation under test to calculate their expected result.
- [ ] Earnings sum raw service compensation and all tips; payroll uses stored
  pay-rate snapshots, preserves historical pay after rate changes, handles
  legacy fallback rates, and follows the agreed non-cash tip rule.
- [ ] Payment validation covers cash-only, card-only, gift-only, two-way and
  three-way splits, zero tips, exact limits and one-cent over-limit inputs.
  Include fixed/percentage discounts and supply costs.
- [ ] Report overview and detail amounts agree for the agreed fixtures; cash
  collection, tips paid out, cash supply, cash discounts, payroll and net income
  have explicit expected values. Empty and multi-technician date ranges work.
- [ ] Gift-card list, lookup and history agree on remaining balance and usage
  after create, update, removal, switching cards and deleting a redemption.
  Editing excludes the owned transaction once; other redemptions remain counted.
- [ ] Gift input validation matches the backend balance for agreed tax/supply
  and rounding fixtures, including exact balance and a one-cent shortfall.
- [ ] Include empty optional amounts, decimal amounts, repeated redemptions,
  date-range endpoints and records outside the range.
- [ ] At least one frontend integration assertion per calculation family proves
  the real consumer uses the tested calculation; backend tests call real APIs.
- [ ] Demonstrate sensitivity by temporarily perturbing representative payroll,
  cash and gift calculations, observing failing targeted tests, and restoring
  source exactly. Do not persist deliberate mutations.
- [ ] All completion checks pass, or the handoff reports actual unresolved
  failures; no skipped/disabled test hides a disagreement.

## Proposed calculation examples

These are proposed fixtures, not newly adopted business rules.

| Scenario | Inputs | Expected result to confirm |
| --- | --- | --- |
| Payroll | $100 service, 50% snapshot, $20 card tip | $50 compensation + $20 payable tip = $70 |
| Mixed cash report | $100 service, $30 cash portion, $20 tip with $5 cash, $10 cash supply, $10 fixed cash discount | $35 cash collected after discount; $30 retained after $5 cash tip payout |
| Gift redemption | $200 balance, $50 service paid by gift, $10 supply paid by gift, $5 gift tip | $68 used, $132 remaining under the existing 1.05 multiplier |
| Combined tax rounding | $0.10 gift service + $0.10 supply | $0.21 usage, $0.79 remaining on a $1 gift |
| Repeated half-cent redemptions | Two separate $0.10 gift service redemptions | $0.11 each; $0.22 used and $0.78 remaining on a $1 gift |

## Implementation notes

Repository inspected on 2026-09-29 at `fc58d93`; checkout was clean. Existing
tests cover authorization, redirects, passwords, shift persistence and shift
draft selection. No dedicated calculation suite exists. Reuse Jest/React Native
Testing Library and Convex Vitest/convex-test without new dependencies.

Relevant implementation: `utils/validation.ts`, `utils/index.ts#getDiscount`,
`components/Form/helpers.ts`, `components/Form/gift-card-inputs.tsx`, reports
overview and detail routes, gift history/modal, `convex/users.ts`,
`convex/transactions.ts`, and `convex/giftCards.ts`.

Current gift input rounds taxed components separately; backend aggregates
unrounded usage and rounds the resulting balance. Supply is charged to the gift
balance whenever linked to that card. Confirm intended cases before freezing
these details into assertions. Also check repeated cash-tip aggregation and
mixed gift/card tips in payroll; code behavior alone is not an expected-value oracle.

Keep backend validation limitations separate from frontend validation tests:
passing form checks does not establish server-side rejection of malformed money.

## Initial executable evidence (before approved fixes)

Implemented 44 new tests: 12 Convex calculation tests and 32 Jest calculation/
consumer tests. Product formulas, dependencies and runner configuration unchanged.

- `npm run typecheck`: PASS, both projects.
- `npm run verify:app`: PASS, zero-warning lint and all 33 app tests.
- Full repository ESLint with no cache/max warnings 0: PASS.
- `npm run test:backend`: FAIL, 54 passed, 1 failed out of 55. Only failure is
  the new aggregate payroll rounding assertion: 3 x $0.03 x 50% gives $0.045;
  expected $0.05 under half-up rounding, actual $0.04 from binary/toFixed rounding.
- `npm run verify:quality`: FAIL at backend tests; its app stage was run
  separately and passed. Do not treat this task as a green completion gate.
- `git diff --check`: PASS. Temporary mutation probes restored exact original
  product source; Git diff confirms no product source changes.
- Sensitivity probes: adding $1 per payroll transaction caused 6 failures;
  dropping the cash-tip payout deduction caused 1 report failure; changing
  gift tax from 1.05 to 1.06 caused 1 balance-lifecycle failure. All restored.
- No platform exports required: no product code extracted/changed. No live
  backend, production data or device/browser flows were exercised.

Known discrepancies/decisions:

1. Payroll half-cent rounding fails the new intended-value regression. Confirm
   half-up rounding before implementing a calculation fix.
2. For $0.10 gift-paid service + $0.10 supply on a $1 balance, frontend shows
   $0.78, backend quotes $0.79. Both current behaviors are explicitly labeled
   characterization tests; neither is declared the correct policy. Supply
   allocation is also preserved, not newly approved.

Coverage delivered: form split limits/errors, currency helpers, real overview/
cash-detail calculations, gift input render and change handlers for service/tip,
gift history/modal totals, payroll snapshots/fallback/zero rates/reassignment,
earnings versus payroll aggregation, inclusive dates/self scope, decimal storage,
gift list/lookup/date-list agreement throughout create/edit/switch/remove/delete.

Remaining acceptance gaps: actual earnings and payroll-detail screens are not
rendered by this new suite; all UI journeys/native behaviors are not covered.
Half-cent payroll result and gift rounding consistency remain unresolved. No
tests are skipped or disabled to hide these gaps, and unchecked acceptance
items above must not be interpreted as complete.

## Review

Independent `calculation_review` reviewer checked fixtures and expected arithmetic.
Requested report flag/query assertions and gift change-handler coverage: added.
Requested realistic sheet opening/history query: added and verified. Reviewer
confirmed arithmetic and noted the payroll failure and screen coverage limits.
Final sheet adjustment self-reviewed and passed types/app gate.

## Final evidence and handoff

User approved the rounding fixes. Added 61 regression tests (19 backend and
42 app tests), including earnings/payroll detail consumers and review-discovered
decimal ties. Payroll sums exact decimal commission fractions before half-up
rounding once. Gift usage rounds combined service/supply tax per redemption,
then adds untaxed tips; all balances sum integer-cent redemptions. Persisted
service/tip totals and their cash/gift components share half-up cent rounding,
so accepted exact splits remain equal after create/edit. Supply precision and
allocation remain unchanged.

- `npm run verify:quality`: PASS; both typechecks, lint, 62 backend tests and
  43 app tests.
- Full repository `eslint . --no-cache --max-warnings 0`: PASS.
- `git diff --check`: PASS.
- `CI=1 EXPO_NO_DOTENV=1 EXPO_PUBLIC_CONVEX_URL=https://example.convex.cloud npx expo export --platform all --output-dir /tmp/glosse-calculation-export --max-workers 2`:
  PASS, iOS/Android/web bundles and 110 static routes.
- Independent reviewer found accumulated payroll ties, fractional gift supply
  and paired-total normalization mismatches. Each was fixed with reproducing
  tests and rereviewed; final review found no remaining actionable defects.

The earlier unchecked checklist and pending decisions document the initial
state; their calculation/consumer coverage is now delivered, including real
earnings and payroll screens. No tests skipped or disabled. This does not prove
native journeys, live OAuth, real backend concurrency, malformed-money rejection
or production deployment. Historical computed gift balances can change by cents
where past redemptions contained tax fractions, because queries now consistently
sum rounded usage per redemption. No schema/storage migration was made.

Stopped at local verification. No commit, push or deployment performed.
