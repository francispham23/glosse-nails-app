# Task: Server-side financial validation

## Contract

- Status: complete; locally verified and independently reviewed.
- Authorization: user requested "start server-side financial validation".
  User replied "Go" after the written plan and recommended choices; this approves
  cash remainder for Cash/Gift without Card and discount caps.
- Outcome: transaction create/edit and gift-card creation reject invalid financial
  input; gift redemption cannot overdraw a card through direct API calls.
- Owned files: convex/transactions.ts, convex/giftCards.ts, a shared pure financial
  validation helper, utils/validation.ts if needed for matching form feedback,
  direct API regression tests under convex/, relevant existing calculation/auth
  fixtures, docs/financial-policy.md and this record. Conditional on the split
  decision, cash form/report consumers, gift creation/preview consumers and their integration tests are also owned
  only to keep the agreed Cash/Gift allocation consistent.
- Out of scope: tax/payroll policy changes, supply-allocation changes, refunds,
  audit-ledger or currency-storage migration, historical-data repair, tenancy,
  dependencies, generated files, environment changes, commits/push/deployment.
- Stop after: locally verified implementation, independent money/auth review,
  and an evidence-backed handoff. No live deployment or production-data access.
- Baseline: clean update-expo-57 at 9362880 on inspection; prior calculation and
  workflow work is now committed. Prior recorded checks: 62 backend/43 app tests
  and all-platform exports; not rerun during this planning pass.
- Verification plan: failing direct mutation regressions first; targeted backend
  and affected frontend tests; npm run verify:quality, node scripts/check-agent-docs.mjs,
  git diff --check and synthetic iOS/Android/web exports. Use isolated synthetic data.

## Proposed behavior

### Numeric inputs and normalization

- Required service/tip values must be complete finite nonnegative decimal strings;
  reject blanks, trailing text, NaN/Infinity, negative values and unsafe magnitude.
  Trim surrounding whitespace; allow ordinary decimal forms such as 0, .50,
  12.34 and previously approved subcent examples 1.005/0.0049. Do not silently
  parse a numeric prefix or impose a two-decimal limit that breaks existing approval.
- Optional blank amounts remain absent; optional zero remains zero. Apply approved
  half-up cent normalization to totals/payment components and preserve supply precision.
  Validate relationships against normalized values that will actually be stored.
- Reject invalid effective payroll rates on new/updated transactions rather than
  storing a broken snapshot; preserve valid historical snapshots/fallback behavior.
  Proposed valid rate range is 0 through 1. No historical backfill.

### Methods, splits and discounts

- Compensation methods must be a nonempty unique subset of Cash/Card/Gift Card.
  Tip methods may be empty only when the total tip is zero. Reject unknown or
  duplicate method names and positive portions assigned to unselected methods.
- Preserve existing tax multiplier, supply allocation and approved rounding.
  Make server caps consistent with form caps; do not redefine card remainder,
  discount/tax ordering or payroll-tip eligibility silently.
- Gift service cannot exceed service compensation after its fixed/percentage
  discount. Explicit cash/gift portions cannot exceed their agreed payable total;
  tip portions cannot exceed normalized total tip. Define Cash/Gift without Card
  through the approved remainder allocation.
- Approved discount cap: amount <= service compensation; percentage <= 100.
  User approved this cap. Require a type
  for a positive discount and prevent contradictory discount metadata.

### Gift creation, lookup and redemption

- Gift creation requires a trimmed nonempty unique code and finite positive value
  that remains positive after cent normalization and fits safe currency arithmetic.
  Do not add a new numeric-only code format. Date must be a valid finite timestamp.
- Positive gift service/tip or a selected Gift Card method requires a valid card.
  Reject missing/unknown codes; never silently drop gift allocation or create an
  orphaned redemption. Non-gift submissions must not introduce accidental gift usage.
- Check all existing usage across staff using the same approved giftUsageCents
  calculation in the recording mutation. Accept exact available balance; reject
  one cent over. UI quote alone is not an authorization/availability check.
- Editing excludes only that stored transaction's previous usage when it belonged
  to the same card; switching cards checks the new card independently.
- Perform validation, balance read and insert/patch/card-reference updates in one
  Convex mutation so competing writes participate in transactional conflict checks.
  Keep existing ownership checks before excluding/editing stored transactions.
- A rejected operation leaves transaction rows, card references and snapshots
  unchanged. Deletion and removal of usage remain available for permitted callers.
  Existing malformed ledger records must not be silently ignored; document the
  chosen failure/recovery behavior without performing a migration.

## Approved decisions

1. Cash + Gift Card without Card: infer the cash remainder (recommended), or
   reject that combination until both portions are explicitly captured. The current
   form only exposes a cash-portion field for Cash + Card, and reports currently
   treat Cash without Card as the full service/tip. A remainder choice therefore
   requires coordinated form/report assertions, not merely server rejection logic.
2. Cap discounts at service compensation/100% (recommended), or preserve current
   limits. The current schema parses discounts but does not enforce these caps.

User approved both recommended choices. To preserve existing cash-report units,
Cash/Gift without Card derives service cash as normalized compensation minus
gift service (before tax/discount); tip cash is total tip minus gift tip. Existing
cash supply/discount report adjustments remain separate. Explicit incompatible
cash portions are rejected; the form clears hidden stale portions on method changes.

## Acceptance criteria

- [x] Valid cash/card/gift and agreed mixed splits create/edit with unchanged
  approved totals, historical snapshots and normalized storage.
- [x] Direct create/edit calls reject malformed, negative, nonfinite and unsafe
  monetary values, bad rates, unknown/duplicate methods and invalid split totals.
- [x] Zero tip, empty optional amounts, decimal ties and raw fractional supply
  preserve the prior approved behavior and remain covered by regression tests.
- [x] Selected gift with missing/unknown code is rejected without any write.
- [x] Exact gift balance succeeds; one-cent excess fails, including editing,
  switching cards and another technician's pre-existing redemption.
- [x] Failed edits preserve the old transaction, old/new card references and rate
  snapshot; valid switching/removal/delete restores balances consistently.
- [x] Unauthorized/inactive callers and spoofed ownership remain denied.
- [x] Gift creation rejects invalid/zero values and empty/duplicate trimmed codes.
- [x] Competing-redemption simulation exercises mutation-level checking; report
  simulation limitations rather than claiming proven live OCC behavior.
- [x] Affected form/report consumers agree with server validation for the selected
  policies; existing expected-value calculation tests remain meaningful.
- [x] Completion gates and independent review pass, or actual limitations/failures
  are explicitly recorded without marking unmet required criteria complete.

## Implementation notes

Read convex/_generated/ai/guidelines.md and schema before implementation.
Use the existing Convex runtime and index-based card/transaction lookups; do not
split validation and writes into separate actions or rely on a client balance.
Retain public API shapes where practical and reuse one domain validation path for
create/edit so alternate mutation paths cannot bypass the checks.

Existing backend calculation fixtures sometimes use Card method arrays while
supplying gift portions. When method validation is added, make those synthetic
fixtures represent the intended legitimate mixed methods; preserve their explicit
arithmetic assertions and add separate rejection cases for mismatched methods.

## Executable evidence

- New direct mutation regressions before implementation: 43 failed / 1 passed,
  demonstrating malformed money, unsupported/mismatched methods, invalid discounts,
  unknown gift codes, invalid rates/creation values and overdrafts were accepted.
- `npm run test:backend -- convex/financial-validation.test.ts`: initially 44/44
  passed after server changes; final suite expanded to 53 direct API tests.
- `npm run test:app -- __tests__/financial-calculations.test.tsx`: 53 passed.
- `npm run test:app -- __tests__/transaction-financial-form.test.tsx`: 5 passed after review repair;
  real method controls, updated inferred remainder, submittability and nonfinite
  draft preview safety. Paper/native platform boundaries are mocked.
- `npm run verify:quality`: passed typechecks, backend/full zero-warning ESLint,
  115 backend tests across 6 files, 59 app tests across 3 files after review repair.
  Intermediate failures: duplicate money import warning and widened payment-method
  array types; both fixed and the complete gate rerun successfully.
- `node scripts/check-agent-docs.mjs`: 13 files, 39 local links, 17 npm references passed.
- `git diff --check`: passed before independent review.
- Synthetic `CI=1 EXPO_NO_DOTENV=1 EXPO_PUBLIC_CONVEX_URL=https://example.convex.cloud
  npx expo export --platform all --output-dir /tmp/glosse-financial-export-final --max-workers 2`:
  passed iOS, Android and web export with 110 static routes.
- Competing calls are a `convex-test` simulation, not verified live OCC/retry
  behavior. Device/browser/manual journeys, live deployment and production data
  were not exercised. Local gates establish a locally verified handoff only.

Acceptance coverage: existing calculations cover legitimate create/edit, snapshot,
zero/subcent/raw supply and switch/remove/delete; authorization suite covers
unauthenticated/inactive/ownership paths. New API suite covers rejection and state
rollback, exact/one-cent balances across staff, edit exclusion/switch rollback,
invalid snapshots/rates, safe gift creation and simulated competing submissions.
New app assertions cover report remainders with legacy absent/persisted cash fields
and actual controls clearing hidden portions on method/amount changes.

## Review

Independent read-only review completed at HEAD 9362880 plus the working tree,
including untracked helper/tests. Ownership checks, all-staff same-mutation gift
checking, rollback and discounted Cash/Gift edits were confirmed.

One form/server parity gap was found: gift preview still used binary rounding of
raw service/discount and raw gift portion, blocking the approved 1.005 tie.
Added three actual form regressions (all failed before repair), then shared the
normalized giftServiceLimit between validation and preview and normalized the
compared gift portion. Rereview found no remaining actionable issues.
Final reviewed fingerprints: financial validation b41cf71c4064, gift preview
b611281ca95b, form regressions 89afe328ea57; transactions 8ad9477183e8 and gift
creation b23bde7c07a8 were unchanged during repair. Source remained frozen during
each review. Final full quality, export, documentation and diff checks passed.

## Handoff

Create/edit now reject invalid financial inputs and check gift availability before
writing. Approved discount caps and pre-tax Cash/Gift remainder are enforced;
forms, previews and cash reports agree. Rejected edits preserve transaction,
card references and rate snapshot. Existing authorization, tax/payroll and supply
allocation rules are retained. No stored data or schema migration was performed.

Implementation, local checks and independent review complete. No commit, push,
deployment, migration or environment change. Remaining validation is an explicitly
authorized isolated live backend with competing redemptions and browser/device
journeys; simulated checks and static exports do not establish release readiness.
