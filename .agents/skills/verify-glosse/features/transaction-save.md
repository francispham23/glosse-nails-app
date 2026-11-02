# Transaction save: executed browser recipe

Prerequisite: launch and successful doctor from [verify-glosse](../SKILL.md).
Let M be the returned manifest path, E its evidence directory. Launch seeds a
synthetic shift; use actor index 1 (active technician), whose private credentials
live in scratch. Sign in at /email/signin using observed placeholders
`Enter your email`, `Enter your password`, and button `Sign In`. Wait for Earnings
and click the visible `Runtime` technician card. Use in-app navigation: full URL
navigation can redirect while the protected stack hydrates.

## Create rejection and retry

1. Run `node scripts/runtime-verification.mjs fixture M create-reject`.
2. On the real create form, fill `Enter Total Charge in Card` with 100,
   `Enter Total Tip in Card` with 20, `Enter  Supply Cost` with 2. Supply/discount
   placeholders contain **two spaces** after Enter. Click button `Discount`,
   then fill `Enter  Discount Amount` with 3. Leave Card methods selected.
3. Click `Submit`. Require alert `Pay rate must be finite and between 0 and 1`,
   retained values 100/20/2/3, enabled Submit and the same create route. Save
   create-rejected.png and create-rejected-ui.txt. Expected Convex rejection may
   also appear in the development console banner; retain the visible form alert.
4. Run `node scripts/runtime-verification.mjs checkpoint M create-rejected`.
   It compares the complete transactions/cards snapshot with the post-fixture
   pre-submit snapshot. Require unchangedStoredState=true.
5. Run `node scripts/runtime-verification.mjs fixture M create-restore`.
   Change only charge to 125 and click Submit; retain tip/supply/discount.
6. Require heading `Success`, message `Earning saved successfully`, disabled
   Submit and Close, and button `OK` while still on the form. Save
   create-success.png and create-success-ui.txt before acknowledgement.
7. Click OK. Require technician transaction list containing Compensation: $125,
   Tip: $20. Save create-acknowledged-ui.txt. Run
   `node scripts/runtime-verification.mjs checkpoint M created`: exactly one added
   row, stored charge125/tip20/supply2/Amount discount3/rate0.5, correct technician.

## Edit rejection and retry

1. Run `node scripts/runtime-verification.mjs fixture M edit-reject`. This targets
   only the new transaction's synthetic payRateSnapshot. Click the visible row
   `Compensation: $125` from the technician list (or Transactions tab).
2. Change charge to 150, keep 20/2/3, click `Update`. Require the same pay-rate alert,
   retained edited values and enabled Update. Save edit-rejected.png/UI snapshot.
3. Run `node scripts/runtime-verification.mjs checkpoint M edit-rejected`:
   full post-fixture stored financial state must be unchanged.
4. Run `node scripts/runtime-verification.mjs fixture M edit-restore`. Click Update
   using the retained draft. Require `Success`, `Transaction updated successfully`,
   disabled Update/Close, and OK on the form. Save edit-success.png/UI snapshot.
5. Click OK, observe list with charge150/tip20. Run
   `node scripts/runtime-verification.mjs checkpoint M edited`: exact expected
   values and no added rows. Save edit-acknowledged-ui.txt and edited-list.png.

Repeated-acknowledgement stress used CUA locator dblclick on OK (create in run1,
edit in run2). Stored checkpoints still showed one create and no additional edit
rows. The second physical click can hit a transaction on the newly exposed list
and open that row: record that landing behavior, then return without submitting
it. This establishes stored effects, not a network invocation count; the app unit
suite separately checks one acknowledgement callback. Single OK navigation was
observed in both runs. Never invent a second OK after the dialog has disappeared.

Run doctor/cleanup and verify cleanup.json. Fresh launch reruns the baseline
financial checks; use a new evidence directory for the second pass. Preserve proof
outside scratch. Native feedback/header behavior remains unverified here.
