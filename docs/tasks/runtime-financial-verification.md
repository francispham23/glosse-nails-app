# Task: Financial runtime verification

## Contract

- Status: partially verified; backend/browser evidence complete below, required
  iOS journeys remain unverified; browser save feedback is repaired in the follow-up.
- Authorization: user said "sure do it" after the recommendation to prepare a
  bounded runtime verification task, then "Approve and start implementation".
  This authorizes the specified disposable local deployment and synthetic checks.
  After the cached binary incompatibility was reported, user said "continue the
  task", authorizing the specifically proposed official compatible backend
  download into task-owned scratch storage. No npm dependencies were installed.
- Outcome: reproducible evidence that the approved financial behavior works on
  a real isolated Convex backend, in the browser and through native iOS runtime.
- Owned files: a focused scripts/runtime-financial-check.mjs harness if useful,
  a docs/runtime-financial-verification.md checklist if needed, this task record.
  Disposable scratch checkout/configuration and internal synthetic fixture helpers
  are allowed only for the isolated verification target after approval.
- Out of scope: production/cloud deployment, production accounts/data/credentials,
  changing financial or authorization policy, migrations, broad product fixes,
  dependency installation/updates, adding an E2E framework, Android/physical-device
  certification, Google OAuth validation, commits/pushes/PR creation.
- Stop after: evidence-backed runtime report and reusable verification instructions;
  stop task-started processes and remove only task-owned synthetic fixtures.
  Any discovered product defect gets a separate bounded repair contract.
- Baseline: clean update-expo-57 at 2f5dacc before this record. Existing financial
  task records 115 backend and 59 app tests plus three-platform static export;
  commit hook task records successful full checks and hook failure/restoration.
  Those are prior evidence, not fresh runtime execution.
- Recommended target: a disposable local Convex backend and isolated scratch
  checkout using the current committed source; browser and iOS Simulator against
  that backend. Do not reuse existing .env files or the production EAS profile.
- Approval scope: starting local backend/app processes, pushing code and internal
  fixture helpers only to that disposable local backend, generating ephemeral
  local auth configuration, creating synthetic test accounts/staff roles/cards/
  transactions and booting a test simulator. No changes to the main checkout's
  environment, schema, generated files, signing configuration or tracked product code.
- Runtime prerequisite: local runtime availability and synthetic Password auth
  setup must be confirmed during execution. If local backend/auth/native app cannot
  run with installed tooling, report that limitation; do not switch to cloud,
  install dependencies or produce an EAS build without a new explicit decision.
- Verification plan: start with one signed-in create/query round trip, then direct
  API boundary and concurrency checks; browser/iOS journeys; full quality gate
  if adding the harness, docs checker and git diff --check. No live production check.

## Acceptance criteria

- [x] Evidence identifies source revision, backend target, app platform/build,
  synthetic fixture and explicit expected/observed values; never records tokens,
  passwords, private keys or production records.
- [x] Real Password-authenticated synthetic manager and two active technicians
  can use their permitted public APIs; an anonymous/inactive actor is denied.
  Internal fixture helpers never substitute for public API authorization checks.
- [x] $105 card accepts two $50 gift-service redemptions (taxed $52.50 each)
  and reaches exactly $0.00; another $0.01 gift-service portion is rejected
  without a transaction/reference change.
- [x] With a fresh $52.50 card per round, two distinct authenticated technician
  clients submit $50 gift-service redemptions concurrently. Across 10 rounds,
  exactly one succeeds per card, one is denied, one transaction/reference exists
  and final balance is $0.00. Report any OCC retries/errors honestly. This is a
  bounded contention check, not proof under every load/interleaving.
- [x] Same-card edit excludes its own usage once; rejected overdraw or switch to
  an insufficient card preserves the original row, references and rate snapshot.
  Successful switch, gift-link removal and authorized delete restore balances.
- [ ] Browser and iOS Simulator flows show $100 service/$40 gift as $60 cash;
  $20 tip/$5 gift as $15 cash. Save/edit and overview/detail reports agree without
  duplicate cash or repeated gift subtraction.
- [ ] Browser and iOS Simulator allow $1.005 service/gift to save as $1.01;
  a valid discounted tie stays submittable. Missing/unknown gift code, excess gift
  balance and invalid discount show feedback and do not change saved records.
- [ ] Method switches clear hidden portions; a rejected save retains the editable
  draft and reports the error. Verify stored state through subsequent queries.
- [x] Reusable harness/checklist, relevant local gates, focused money/auth review
  and runtime evidence are complete. Missing required runtime results remain
  unchecked; reports do not conflate simulator, physical device or production.

## Implementation notes

Current auth supports Google and Password. Prefer synthetic Password accounts
to avoid external Google credentials. Staff access requires active staffRoles;
signup alone is insufficient. Seed only isolated fixtures via internal helpers,
then exercise actual authenticated public calls and UI journeys.

The installed Convex CLI exposes --env-file and configuration for local/cloud
development; dev pushes functions and may regenerate files. Run it only inside
the disposable scratch checkout against the explicitly selected local target.
Treat backend initialization as an approved local deployment, not a read-only check.
Keep temporary auth/configuration in the scratch environment, never in prompts
or tracked artifacts. The production EAS profile names a cloud deployment and
must not be used for these tests.

simctl is installed at /Applications/Xcode.app/Contents/Developer/usr/bin/simctl;
this does not yet prove an available simulator or compatible app runtime.
adb and maestro were not found on PATH. No browser/native E2E framework or
financial runtime harness was found in the repository's scripts/config inventory.
Prefer available browser/native UI controls and the existing app; do not add a
framework simply to execute this bounded checklist.

Keep the seed/run/cleanup sequence scoped by a unique synthetic run ID. Confirm
the target before any write; a reusable harness must reject production/unknown
targets by default. Cleanup only records/processes created by this task.
On a failure, preserve enough redacted evidence to reproduce it and stop any
destructive cleanup that could remove unrelated records.

## Executable evidence

Executed locally on 2026-10-01 against committed source `2f5dacc`:

- Scratch source: `/tmp/glosse-runtime-20261001/source`, shared clone with existing
  node_modules symlink. No normal .env copied, main product/generated/config files
  changed, new dependencies installed, commit/push or cloud deployment performed.
- Target: instance `glosse-runtime-20261001`, API `http://127.0.0.1:33210`, actions
  `http://127.0.0.1:33211`, task-owned SQLite/storage, beacon disabled.
  Official backend `precompiled-2026-09-28-5c7cb5b`, binary SHA-256
  `c6290f5a86bc2f6b31a931833c25106ccc06c0c8c9f0894c35f2d7cecf1fd676`.
  The earlier cached 2025 backend could not support installed CLI key generation;
  the authorized official download resolved that prerequisite.
- Ephemeral RSA/JWKS configuration and synthetic Password sign-in succeeded.
  Fixture run ID `runtime-20261001`; one manager, two active technicians and one
  inactive technician. Keys, passwords and tokens stayed in private scratch state.
- `node scripts/runtime-financial-check.mjs ../credentials.json`: exit 0, all
  three PASS groups. Repeated on a fresh empty database using the retained harness
  and its emitted fixture source: exit 0. The final harness additionally checks
  explicit denial messages, all four roles/activity states and unauthorized quote
  exclusion. Both runs included 10 concurrent rounds each; every round had one
  success, one insufficient-balance denial, one row/reference and $0.00 balance.
  No internal OCC retry count was observable.
- Exact-balance checks observed $52.50 then $0.00 from a $105 card; excess,
  anonymous and inactive requests caused no financial change. Same-card edit,
  ownership denial, edit/switch rollback, switch, removal and delete matched the
  checklist. Rollback assertions compared complete rows/cards, including snapshots.

### Browser evidence

Platform: desktop Chromium in Codex in-app browser, 1280×720 viewport, scratch
Metro development web bundle, Expo 57.0.24 / RN 0.86.3, JS source `2f5dacc`.
Synthetic manager signed in through the app's ordinary Email/Password screen.
A shift was selected through Earnings; eight UI cards were seeded through the
manager's authenticated public API (four per platform, $200 each).

| Case | Observed UI and authenticated stored result |
| --- | --- |
| Cash + Gift service/tip | $100 service/$40 gift → $60 cash; $20 tip/$5 gift → $15 cash. Saved and reopened. One linked transaction; balance $153; stored cash 60/15, gifts 40/5, rate snapshot 0.5. |
| Edit service total | $120 → $80 service cash, $15 tip cash; overview collection $95, retained $80; cash detail $95. One linked transaction; balance remained $153. |
| Original cash reports | Returned service to $100 through the form: overview $75 collected/$60 retained; detail $75 with $60 service/$15 tip; technician summary $15 cash tip. |
| Method switch | Enabled Card on service/tip, entered explicit cash 7/3, removed Card. Inputs disappeared; remainders became 80/15. Saved/reopened and public query showed 80/15, with no stale 7/3. |
| Fractional cent | Service/gift `1.005` saved as 1.01/1.01; $200 card balance $198.94. |
| Fixed discount tie | Service `1.005`, discount `0.10`, gift `0.905`: saved 1.01/0.10/0.91, Amount; balance $199.04. |
| Percent discount tie | Same service/gift with 10%: saved 1.01/0.91, Percent 10; $0.96 gift usage. |
| Form denial | Missing/unknown code, $200 gift service on a $200 card ($210 taxed), Amount 251 on service 250, Percent 101: visible feedback and disabled Submit. Final public queries contained only the intended successful browser saves. |
| Changed live balance | Draft service/gift 100 was initially submittable on a $199.04 card. Other authenticated technician redeemed $157.50; card became $41.54. Draft kept 100/100, showed insufficient balance (preview remainder -$63.46), disabled Submit. Public query found only the prior rounding row and competing redemption; no draft save. |

Redacted screenshots were saved outside the repo in the task visualization folder:
`runtime-cash-report.png` and `runtime-balance-draft.png`. Final browser cards:
mixed $153 with one row; tie $198.94 with one row; fixed-discount $199.04 with one
row; shared percent/race $41.54 with two rows. These are synthetic fixtures only.

### Defect and deferrals

- **Confirmed browser success-feedback defect:** clicking Update persisted the edit,
  but displayed no success notice and did not leave the form. Repeated for service
  edits and method switches; a manual back/reopen showed the saved values.
  `app/(root)/(main)/transaction/[transactionId]/edit.tsx` uses React Native
  `Alert.alert`, with navigation exclusively in its OK callback. The web Alert
  implementation is a no-op; product repair is outside this verification contract.
  Error paths also use Alert, but post-submit server-error visibility was not
  executed and is not claimed verified.
- **Required server rejection journey deferred:** the reactive quote disabled Submit
  before a request could be sent. This established form prevention/draft retention,
  not visible feedback after an actual server rejection. A controlled interleaving
  is needed for that criterion; backend rejection/rollback itself passed.
- **Required iOS journeys blocked by UI control:** task booted iPhone 18 Pro,
  iOS 27.0, UDID `8605F9EB-37D5-40FB-97E9-E15380C7AD0D`. Existing Expo Go 57.0.9
  was found. Apple now exposes this simulator through Device Hub. Safari accepted
  the local Expo URL but stopped at its “Open in Expo Go” dialog; AX exposed a
  sheet without actionable Open/Cancel buttons. Coordinate attempts failed with
  noWindowsAvailable; keyboard confirmation did not advance. No native app
  sign-in/form/report journey passed. No EAS build, app install or simulator erase.
- Combined browser/iOS acceptance items remain unchecked because iOS did not run;
  the method-switch/server-feedback item remains unchecked for its server-feedback
  portion. Production, Google OAuth, Android and physical devices are out of scope.

### Completion checks

- Changed harness ESLint, zero warnings: passed.
- `npm run verify:quality`: passed both typechecks, backend lint, 115 backend tests,
  full zero-warning Expo ESLint and 59 app tests. These are local simulated checks.
- `node scripts/check-agent-docs.mjs`: passed (13 files, 39 local links, 19 npm
  references). `git diff --check`: passed. New checklist links resolve locally.
- Platform exports not rerun: no product/bundle/dependency changes in this task;
  previous export results do not substitute for the deferred iOS journey.

## Review

Self-review of the harness/checklist: target is fixed loopback, fixtures are
scratch-only/internal and guarded by the run ID, tested financial calls use
ordinary authenticated clients, expected values are literals, denied requests
compare full stored state, and contention requires the correct denial category.
An independent procedure reviewer was requested but failed due an account usage
limit; no independent approval is claimed. Reviewed source baseline `2f5dacc`;
reviewed artifact SHA-256 fingerprints:

- Harness: `523fa7809b2967410bce4d884d28dc5f43853bbdf6218d2474791dc8e92fc45d`.
- Checklist: `bad2e6c17cb08fffe9ccdf60291a2c2ff598a0e450a04336fe6f205abbda95fc`.

Source confirmation for the browser defect: installed
`node_modules/react-native-web/dist/exports/Alert/index.js` implements
`static alert() {}`. The observed edit persistence therefore does not establish
working success/error feedback.

## Handoff

Backend runtime checks and the listed browser cases passed. The overall contract
remains partially verified for the explicit deferrals above. Next bounded product
repair: platform-compatible save success/error feedback and navigation, retaining
editable drafts on failure; verify browser and iOS behavior afterward. No product
repair was made in this verification task.

Task-started Metro stopped. Task-booted simulator shut down without erasing it.
Final backend stopped, PID absence confirmed, and the complete task-owned scratch
folder removed (source, downloaded binary, DB/storage, credentials and synthetic
accounts/records). No listeners remained on 33210, 33211 or 8081; the booted-device
list was empty. Browser test tab closed. Only the two redacted screenshots and the
three repository artifacts remain. No credentials/test records retained.

## Follow-up repair evidence — 2026-10-01

See [transaction save feedback](transaction-save-feedback.md): user approved with
Go. Working-tree repair on 2f5dacc passed 115 backend/66 app tests, lint/typechecks
and final all-platform export. Isolated browser checks exercised real create/edit
server rejections with synthetic invalid pay-rate fixtures; visible concise errors,
retained drafts, complete rollback, successful retry and success acknowledgement/
navigation passed. The earlier browser Update defect is repaired. This closes the
browser post-submit feedback gap, but not the specific insufficient-balance TOCTOU
journey or any required iOS financial/save flow. Those remain unverified.
