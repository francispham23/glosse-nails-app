# Task: Repeatable isolated Glossé runtime verification

## Contract

- Status: complete (approved browser/backend verifier; native excluded)
- Authorization: After phase 1 completed and stage 2's written contract was presented, the user said **“Approve and start implementation”**. This authorizes the enumerated helper/skill changes and explicitly disposable loopback deployment, synthetic fixtures and cleanup. Product fixes, native certification and shared release actions remain out of scope.
- Outcome: An executable, project-local `verify-glosse` skill that can launch an isolated browser/local-backend instance, establish its identity, exercise transaction create/edit rejection and retry, retain redacted proof, and clean up only its own resources. The first deliverable is web/backend verification; it does not certify native behavior.
- Owned files:
  - `.agents/skills/verify-glosse/SKILL.md`
  - `.agents/skills/verify-glosse/features/{README.md,transaction-save.md,gift-card-access.md,session-access.md}`
  - `.agents/skills/verify-glosse/{UPSTREAM.md,LICENSE-pstack}`
  - `.agents/skills/glosse-task/SKILL.md` (one conditional runtime-verification pointer)
  - `scripts/runtime-verification.mjs` (launch/doctor/evidence/cleanup helper; no app dependency)
  - `scripts/runtime-financial-check.mjs` (only if needed for reusable run-owned fixture/snapshot interfaces; preserve its existing assertions and success/denial behavior)
  - `.gitignore` (allowlist `verify-glosse` only)
  - `docs/tasks/runtime-verification-skill.md`
  - Task-owned scratch checkout, temporary synthetic auth/fixture source, process manifests and disposable backend data. Redacted evidence outside the repo in a separately named retained artifact directory.
- Runtime authorization proposed: Start task-owned local backend/Metro processes; copy current application source into an isolated scratch checkout excluding env files/secrets/production configuration; configure ephemeral Password auth; push source/internal fixture helpers only to that identified disposable loopback backend; create synthetic users/roles/cards/transactions. An official compatible backend binary may be downloaded to task-owned scratch if required, with its immutable release and checksum established before execution. This is an explicit local deployment/mutation scope, not a read-only check. No simulator boot or native app installation is requested by this first contract.
- Out of scope: Production/cloud backends, normal credentials/environment/configuration, application/schema/financial/auth policy fixes, generated files in the main checkout, npm dependency installation/updates, E2E framework installation, native runtime certification, OAuth validation, simulator/device mutation, scheduled automation, external messaging, delegation, commits/pushes/PR/deployment to shared targets. Preserve all uncommitted phase-1 work.
- Stop after: Two fresh isolated runs prove the transaction-save browser recipe and process/data cleanup, evidence remains available after cleanup, instruction/helper validation and self-review complete, uncommitted handoff. Found product bugs get a separate repair contract; unavailable required runtime acceptance remains unchecked and prevents completion.
- Verification plan: Syntax/lint changed executable helpers; exercise wrong-target/busy-port/stale-manifest refusal using synthetic scratch data; execute launch → doctor → actual UI create/edit rejection/retry → verify stored results → cleanup twice from fresh fixtures. Check no run-owned listeners/processes remain and unrelated runtimes are untouched; proof files survive. Run applicable `npm run verify:quality` for retained helper changes per prior harness precedent, metadata/link/docs checks and `git diff --check`, plus untracked-file scope/whitespace review. Do not claim exports prove this runtime path.
- Baseline: `update-expo-57`, HEAD `a38492dacc2555bea801240ce89b89bfd9f95653`. Phase 1's four modified tracked files and 21 untracked owned files are present and must be preserved. Current harness pins API to `http://127.0.0.1:33210/`, requires a private credentials file, guarded run ID and initially empty financial snapshot. It creates synthetic actors and exercises real public APIs; it is not a UI driver or launcher.
- Assumptions / unresolved decisions: Recommend browser/backend first because the current callable tool inventory exposes no dedicated Device Hub control and historical native app/backend identity is unconfirmed. Use available browser tools and existing installed packages rather than add Playwright/Maestro. Confirm exact binary/startup/control commands during implementation; missing prerequisites do not authorize a cloud fallback, EAS build or dependency install. No unresolved business rule; environment/runtime permission is included in this proposed approval scope.

## Acceptance criteria

- [x] Launch creates a fresh task-owned scratch environment from the actual current application source and records source fingerprint, backend binary/version, API/site/app URLs, run ID and owned process identities. It never reads normal `.env` files, reuses a shared backend or assumes an occupied port is ours.
- [x] Doctor is read-only and verifies process ownership, readiness, exact source/build/backend target, private credential permissions, synthetic authenticated identity and fixture run ownership. Missing, wrong-target, stale or ambiguous identity refuses to drive or mutate rather than defaulting to a normal app.
- [x] Wrong-target/cloud URL, occupied unrelated port, stale process identity and existing foreign scratch/evidence destination paths fail safely. Failure cleanup operates only on verified run-owned resources; PID reuse/name matching cannot kill another process. Tests/checks use synthetic resources, not the user's running app.
- [x] Through the real browser UI, synthetic create and edit requests receive actual backend rejection after valid form entry. Error is visible, edited draft is retained and stored financial state is unchanged. Rejection helpers are guarded synthetic setup only; user actions use actual public mutations.
- [x] Restore the synthetic fixture, retry the retained draft and observe success confirmation, disabled submission while awaiting acknowledgement, and navigation after OK. Repeated acknowledgement does not submit again. Stored reads show exactly one create and no extra rows for edit; explicit expected values are independent of the helper being checked.
- [x] Run the documented launch/doctor/transaction recipe/cleanup from fresh fixtures twice. Retain redacted action/result screenshots or accessible UI snapshots, relevant logs and stored-effect comparisons with platform/build/source/target/run identity. No password, token, private/admin key or production data enters output/evidence.
- [x] Cleanup after successful and failed runs removes only run-owned processes, credentials and scratch data. It retains proof artifacts and records owned-process/listener absence without terminating pre-existing runtimes. Interrupted runs can be diagnosed/cleaned by manifest without blind process-name kills.
- [x] The portable skill has concrete executed commands, health checks, stable observed UI handles, evidence locations and teardown instructions; metadata/references/allowlist validate. Feature map distinguishes verified transaction behavior, verified API-only gift/session cases and any unexecuted browser/native paths. A never-run native recipe remains a draft and cannot be used as completion evidence.
- [x] Stage-1 files and all product/dependency/generated files remain unchanged except the newly approved conditional pointer/allowlist. Final file list matches owned scope, applicable checks and self-review complete; native/runtime limitations and review state are explicit at handoff.

## Implementation notes

### Research facts and reuse

- `scripts/runtime-financial-check.mjs` currently emits scratch-only internal fixture source with `--fixture-source`; requires a mode-0600 local credentials JSON; asserts exact loopback URL/port; signs up one manager, two active technicians and one inactive technician; writes private actor credentials only to scratch. Its public API checks cover exact shared balance, denied requests with full snapshot equality, ten contention rounds, ownership and edit/switch/delete effects. Reuse these checks rather than replace domain assertions with UI screenshots.
- `docs/tasks/runtime-financial-verification.md` records successful isolated API and browser checks with synthetic Password auth and ephemeral RSA/JWKS. Those are historical evidence. Exact startup/auth setup must be rerun and made reproducible, not copied as a passed current check. Its prior backend pin/checksum is a useful investigation lead; it is not permission to use an unverified replacement binary.
- `docs/tasks/transaction-save-feedback.md` records a real rejection technique: invalid rate only on run-owned synthetic staff/transaction snapshots; restore it before retry. Existing product validators and handlers remain unchanged. Its final lines explicitly state browser financial evidence predates the native header/memoization repair and native isolation was unconfirmed.
- `package.json` provides Expo start/web scripts and local lint/typecheck/backend/app quality checks; no browser/native E2E framework is installed. Current exposed tools include browser/native-host CUA, but no dedicated Device Hub driver. This inventory is not proof that an iOS path is impossible; native driver discovery is a later separately scoped prerequisite.

### Helper and recipe shape

Implement run-manifest based launch/doctor/cleanup with explicit owned paths and process identity. Backend writes require the approved loopback target and matching run ownership, not only a user-supplied URL. Maintain a private credentials path separate from redacted proof; preserve evidence after teardown. Default busy ports fail rather than selecting another backend; any alternate ports require compatible guard/configuration and exact identity proof.

Use installed tooling and repository code in scratch; deployment/configuration must be explicitly local and must not regenerate the main checkout. Before creating/editing scratch Convex helper source, read `convex/_generated/ai/guidelines.md` and applicable Convex guidance. Fixtures may set deliberately invalid synthetic state to exercise the real rejection; public mutation and UI handler code stays real. Inspect financial/access policies for proof expectations.

Adapt pstack's `create-verification-skill` recipe at reviewed SHA
`7022c81efb48d8b5eb15498ce6043a3bd74b694c`: launch, doctor, real user drive,
observed effects, retained proof and owned cleanup. Use `.agents`, Codex metadata
and actual available tools rather than `.cursor`, placeholder controllers or an
automatic PR/maintenance loop. Preserve MIT notice/provenance. Use installed
`writing-for-agents` and skill-creator guidance for concise conditional instructions.

Seed three feature files, but do not imply all surfaces ran. Transaction save is
the complete browser pilot. Gift-card and session files may initially describe the
already executed authenticated API harness while listing UI/native coverage as
unexecuted. Never put guessed selectors or untested commands in a verified recipe.

## Executable evidence

### Executed runtime and safety checks

- Helper: `scripts/runtime-verification.mjs` provides launch, read-only doctor,
  guarded fixture setup, independent stored checkpoints and owned cleanup. The
  financial harness's only retained change saves its already-issued actor token
  in its existing private credentials JSON so doctor need not sign in or mutate.
- Official backend release `precompiled-2026-09-28-5c7cb5b`, macOS arm64. Archive
  SHA-256 `c1613bb4a3ac884871184020662c865a045cde95ad781fff002a6bd25f2f2890`;
  executed binary SHA-256 `c6290f5a86bc2f6b31a931833c25106ccc06c0c8c9f0894c35f2d7cecf1fd676`.
  Both hashes are checked before execution. Dependencies reused; none installed.
- Run1: `/private/tmp/glosse-runtime-proof-run1`, run ID
  `runtime-9ef4ecd9a0bf867d`; run2:
  `/private/tmp/glosse-runtime-proof-run2`, run ID
  `runtime-3589c0f39938d0e2`. Current application source fingerprint in both:
  `bb385a506ff1c88987be62b19ac092cc0a34ee3e95284b7fb64c690057e3cff7`.
  Manifest records the file inventory/process start-command fingerprints and
  launch.json records backend/source/target identity. This is an Expo Metro
  development build; the source digest excludes generated Convex/Uniwind types.
  It is not a release-bundle/device-build hash.
- Executed launch → doctor → real browser create rejection → checkpoint → restore
  → retained-draft retry → success dialog/disabled Submit → OK → created checkpoint;
  then edit rejection → full snapshot checkpoint → restore → retry → success
  dialog/disabled Update → OK → edited checkpoint → cleanup on both fresh databases.
  Source and private identity checks ran before every fixture/checkpoint.
- Both rejection alerts said `Pay rate must be finite and between 0 and 1` after
  valid real form entry. Create retained charge100/tip20/supply2/Amount discount3;
  edit retained charge150/tip20/supply2/discount3. Complete transactions/cards
  snapshots were unchanged after rejected requests. These snapshots are taken
  after deliberately invalid synthetic setup, so fixture changes are not mistaken
  for mutation rollback failures.
- Each run added exactly one UI-created transaction: financial count12 →13.
  Successful create independently read charge125/tip20/supply2/Amount discount3/
  payRateSnapshot0.5 and the correct technician. Edit read charge150 with the
  other expected values retained, count13. Success remained on the form until OK.
  Single acknowledgement reached the technician/list view; final edited-list
  screenshots show charge150/tip20. Screenshots and accessible snapshots were
  saved before acknowledging each success dialog.
- Repeated-ack stress: double click OK for create in run1 and edit in run2;
  checkpoints still showed one create/no added edit rows. The second physical
  click can hit a transaction on the newly exposed list and open its edit screen.
  Returned without submitting that row. This proves stored effects, not a network
  invocation count; the passing app suite separately covers one acknowledgement
  callback. The recipe records this behavior instead of inventing a second OK.
- Each launch ran real authenticated API baseline checks: exact shared balance,
  excess/anonymous/inactive denial and rollback; ten concurrent rounds with one
  success/one balance denial/one row-reference/zero balance; ownership, same-card
  exclusion, rejected edit/switch rollback and successful switch/removal/delete.
  Retained backend-checks.txt contains only allowed PASS lines. Internal OCC retry
  counts were not measured. Gift-card/browser and inactive/native UI unexecuted.
- Initial failed launch `/private/tmp/glosse-runtime-proof-first`: backend baseline
  passed; app health timed out because Expo bound IPv6 localhost while the checker
  used IPv4 127.0.0.1. Failure cleanup removed owned processes/scratch and retained
  cleanup.json. Corrected app URL to localhost and probe both loopback families.
  Run1 seeded its synthetic shift through the public manager API after discovering
  the earnings list requires a shift. Run2 launch seeds this automatically; the
  final documented in-app card path succeeded without manual setup.
- Safety refusal proof in run2 guard-checks.json/destination-checks.json: cloud
  URL refused before network access; changed process fingerprint refused doctor
  and cleanup; busy runtime ports refused fresh launch without creating a new
  evidence path or terminating existing processes; existing foreign destination
  refused and sentinel retained; unrelated IPv6 listener refused and remained
  alive. Synthetic guard resources were removed by their creating check scripts.
- Final hardening validation `/private/tmp/glosse-runtime-proof-identity`, run ID
  `runtime-dfdc013794062f34` (actual manifest is authoritative): fresh final helper
  launch/doctor and API baseline; repeated read-only doctor left full financial
  snapshot unchanged; changed scratch package source refused; restored source
  passed. A synthetic interrupted `launching` manifest refused doctor but cleaned
  safely; repeated cleanup was idempotent. identity-checks.json/cleanup.json retain
  outcomes. No additional browser coverage is claimed for this validation run.
- Cleanup on both browser runs and the final identity run verified owned leaders
  absent and API/site/app ports free on IPv4/IPv6, deleted private credentials,
  ephemeral auth keys, backend data and scratch source, and retained proof files.
  No live test tabs remain. No process-name kills or pre-existing runtime reuse.

### Local completion checks

- `npm run verify:quality`: passed; both TypeScript projects, backend lint,
  115 backend tests across6 files, app lint, 78 app tests across4 suites.
  The standard Expo lint command loaded normal env files without showing values;
  the isolated launcher did not read them. This gate did not deploy anything.
- Final `node --check scripts/runtime-verification.mjs`, focused ESLint for both
  helpers, `node scripts/check-agent-docs.mjs` and `git diff --check`: passed.
  Canonical docs checker:13 files,53 local links,19 npm references.
- New skill's installed js-yaml checks passed YAML parsing, allowed name/description
  fields, name syntax/length and description type/length/content. Python
  quick_validate.py could not run in either available Python because PyYAML is
  missing; no dependency added and no Python-validator pass claimed.
- Explicit new-skill scan:7 files,15 local links, no trailing whitespace/conflict
  markers; copied pstack MIT notice byte-for-byte. Scoped source/helper/task scans
  and tracked/untracked file-list review passed. .gitignore exposes all7 skill files.
- Phase1's24 instruction/allowlist files rehashed after subtracting only the approved
  verify-glosse pointer/allowlist: original fingerprint
  `59bc878fb4690a125784a9bca753c25332a110b985054e35b0034bb2802d9f43` preserved.
  Prior stage1 task record preserved. Git changes outside named stage1/stage2 scope
  absent; product, schema, dependency and generated files unchanged.

## Review

Self-review of the final helper, financial-harness delta, seven skill files,
conditional pointer/allowlist, task and retained proof; no independent agent.
Reviewed target/credential/process ownership, fixture-only invalid rates, snapshot
rollback, source-copy identity, real browser/public mutations, evidence redaction
and teardown. Repairs: IPv6 readiness/busy-port mismatch; synthetic shift navigation
prerequisite; read-only doctor using already-issued tokens; scratch/inventory/role
identity checks; bounded official download; command failure output withheld to
avoid exposing subprocess arguments. Final hardening launch/guard checks passed.

Repeated-click landing behavior is documented, not silently treated as a second
success acknowledgement. Python validator availability is explicitly distinguished
from the successful installed-parser metadata checks. No unresolved finding within
this approved verifier scope; no product behavior was changed to make checks pass.

## Handoff

All nine scoped acceptance items satisfied by the evidence above. The portable
verify-glosse skill is installed project-locally and conditionally reached by
glosse-task for approved runtime verification. Transaction save has current
browser/backend evidence; gift/session feature files accurately separate API-only
results from unexecuted UI paths. Native/device, Google OAuth and release readiness
remain outside this contract and unverified.

Changes remain uncommitted/unstaged. No global setting, product/dependency edit,
shared deployment, native installation, delegation, automation or external message.
The separately proposed two-task pilot/retrospective still needs its own contract;
this implementation does not claim measured improvements in agent outcomes.
