# Financial calculations

This document separates approved rounding rules from characterized behavior
and unresolved decisions. It describes the single-business app. It does not
authorize financial-policy changes, deployment or a storage migration.

## Approved rounding rules

User approval is recorded in [the calculation task](tasks/critical-calculation-regressions.md).
The shared implementation is [utils/money.ts](../utils/money.ts).

- For valid nonnegative decimal amounts, half-cent ties round up.
  Transaction service/tip totals and their cash/gift components normalize to
  cents consistently: 1.005 becomes 1.01; 2.675 becomes 2.68.
  Supply retains its existing precision.
- Payroll commission uses each transaction's effective rate, sums exact decimal
  commissions and rounds once after aggregation, not per service.
  Three $0.03 services at 50% yield $0.05; three $0.15 at 50% yield $0.23.
- One gift redemption taxes the combined gift service and supply at the
  existing 1.05 multiplier, rounds that charge once, then adds untaxed gift tip.
  A $0.10 service plus $0.10 supply consumes $0.21. Two separate $0.10 service
  redemptions consume $0.11 each, totaling $0.22.
- Gift balances subtract the sum of rounded redemption cents from card value.
  Form previews/change handlers, backend lookup/list/date-list, history and
  gift reports use this same usage calculation.

Examples: a $200 card with $50 gift service, $10 supply and $5 gift tip consumes $68
and leaves $132. Gift service 1.005 persists as 1.01 and consumes 1.06 with no
tip/supply. Service 0.20 plus raw supply 0.0049 consumes 0.22.

These examples retain the existing 5% multiplier; they do not establish legal
tax treatment. Historical computed balances can differ by cents because queries
now sum rounded usage per redemption. There was no stored-data migration.

## Characterized behavior preserved by regression tests

These are current app semantics, not newly adopted business policy.

### Earnings and payroll

- Earnings sum raw service compensation and all recorded tips.
- Payroll commission uses payRateSnapshot when present (including zero),
  otherwise the current staff rate, otherwise 0.5. Editing for the same technician
  retains the historical snapshot; reassignment resolves the new technician's rate.
- Payroll tips currently contribute only when tipMethods includes Card:
  total tip minus tipInCash. Gift-only/cash-only tips contribute zero. Mixed
  Card/Gift handling follows that formula; do not silently reinterpret it.
- Payroll results currently omit technicians with zero commission.
- Date ranges are inclusive; caller role/self scope remains governed by
  [access policy](access-policy.md). Report flags change calculations, not access.

### Discounts, cash and income reports

- Amount discount is the recorded value; percentage discount is the percentage
  of full service compensation. Cash-discount/supply flags select their cash effect.
- In the tested mixed fixture, service $100, cash portion $30, total tip $20 with $5
  cash, cash supply $10 and fixed cash discount $10 produce overview collection $45
  before discount, cash detail $35 after discount and retained cash $30 after tip payout.
- The overview's Net Income is service income minus payroll commission; the
  label does not establish accounting profit after all business expenses.

### Gifts and persistence

- Supply is charged in gift usage whenever the transaction is linked to a card;
  this existing allocation is preserved even for mixed methods.
- Editing quotes exclude the owned transaction once; other redemptions remain.
  Switching cards, removing a gift link or deleting usage restores the previous
  card's computed balance. Stored-record permission checks still apply.
- Empty optional inputs remain absent; zero values are retained. Frontend split
  checks are exercised through the real Zod schema and gift input consumers.

## Executable regression coverage

- [Backend calculations](../convex/calculations.test.ts): snapshots, legacy/zero
  rates, raw/payroll totals, date endpoints/self scope, reassignment, create/edit
  decimal normalization, repeated gift rounding and create/edit/switch/remove/delete.
- [Frontend calculations](../__tests__/financial-calculations.test.tsx): form
  split limits, discounts, currency ties, actual earnings/payroll/report consumers,
  gift input render/change handlers, history and modal balance totals.

```sh
npm run test:backend -- convex/calculations.test.ts
npm run test:app -- __tests__/financial-calculations.test.tsx
npm run verify:quality
```

Expected values must be explicit fixture arithmetic, not calculated by the
implementation under test. A policy change needs an approved task and changed
expected values with rationale, not weakened/skipped tests.

## Approved server validation

Approval is recorded in [the server validation task](tasks/server-financial-validation.md).
Create/edit share [financial validation](../utils/financial-validation.ts), also
used by the form. Gift availability is checked inside the recording mutation.

- Money strings are trimmed complete nonnegative decimals; blanks are accepted
  only for optional values. `.50`, `1.005` and fractional supply remain supported.
  Numeric prefixes, scientific notation, negative/nonfinite values and unsafe
  magnitudes are rejected. Each amount is capped at one quarter of safe integer
  cents, leaving arithmetic room for service, supply, tax and tip.
- Effective rate snapshots must be finite in 0..1. Valid historical snapshots
  survive a current rate change; reassignment resolves and validates the new rate.
- Methods are unique Cash/Card/Gift Card values. Compensation needs a method;
  positive tip needs a method. Positive cash/gift portions need the matching method.
- Fixed discounts cannot exceed service compensation; percentage discounts cannot
  exceed 100. Positive discount needs its type. Gift service cannot exceed discounted
  service compensation, even if supply increases the payable total.
- With Card, explicit service cash plus gift portions cannot exceed taxed service
  and supply minus discount. Tip portions cannot exceed total tip.
- Cash without Card is a pre-tax service remainder: compensation minus gift service;
  cash tip is total tip minus gift tip. Any explicit cash portion must match that
  remainder. Cash supply/discount adjustments retain their separate report behavior.
  Forms clear hidden cash fields and display the inferred Cash/Gift remainder;
  reports count it once whether or not the cash portion was persisted.
- Gift creation trims a nonempty unique code, normalizes a positive finite safe
  value to cents and requires a valid finite timestamp. A selected gift method
  requires a known code. A code without a selected gift method creates no gift link.
- Redemption checks all staff's usage by card index before insert/patch, using
  the same per-redemption rounding. Exact balance is allowed; excess is rejected.
  Editing excludes only its own usage on the same card, after ownership checks;
  switching checks the new card. References and transaction writes are atomic.
- Invalid legacy gift service/tip/supply or card value fails closed with a manager
  recovery message. An authorized edit may replace its own invalid usage; removing
  a gift link/deleting usage remains possible. No historical repair is performed.
  Reads are bounded to 10,001 records; more than 10,000 linked transactions rejects
  validation/reference rebuilding instead of relying on a partial balance.

Regression evidence: [direct mutation tests](../convex/financial-validation.test.ts),
[form interactions](../__tests__/transaction-financial-form.test.tsx) and the
existing calculation/report suites. Competing submissions are simulated in
`convex-test`; real deployment conflict retries and device/browser journeys remain
unverified.

## Unresolved decisions

Keep these separate from the approved rounding task:

- Gift-only and mixed gift/card payroll tips, mixed-method supply allocation,
  zero-commission payroll rows and accounting/report terminology need confirmation
  before changing their current behavior.
- Calendar/timezone and daylight-saving boundaries need product decisions and
  fixtures; tested inclusive timestamps do not establish calendar behavior.
- Legacy-data correction, refunds/audit trails and storage migrations are separate
  tasks. Local simulated checks do not prove real device, OAuth or concurrency behavior.
