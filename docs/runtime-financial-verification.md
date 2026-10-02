# Financial runtime verification

Use this checklist with [the approved task](tasks/runtime-financial-verification.md)
and [financial policy](financial-policy.md). It is a procedure, not evidence that
runtime checks have passed. Use a disposable local deployment and synthetic data.

## Prerequisites and isolation

1. Record the source commit and use a scratch checkout. Do not copy .env files,
   production data or credentials from the normal workspace. Keep generated
   files and ephemeral auth configuration in that checkout.
2. Confirm that the installed local Convex backend supports the installed CLI.
   Bootstrap requires the backend's `keygen admin-key` command. If it is absent,
   stop for explicit approval to obtain a compatible backend binary. Do not
   select an existing cloud deployment as a fallback.
3. Start the disposable backend on unused loopback ports. Confirm its instance,
   storage location and target before deployment or any seed/write operation.
   Disable external telemetry where the installed backend supports it.
4. Configure ephemeral Password auth on that target. Give the browser and iOS
   app the explicit local API/site URLs. Do not use the production EAS profile.
   Do not expose local admin keys, passwords, JWT keys or tokens in evidence.
5. Generate a unique run ID. Create synthetic manager, two active technicians
   and an inactive technician using reserved `.invalid` email addresses. Seed
   roles using internal helpers only in the scratch deployment. Never add an
   authentication bypass or public role-creation endpoint to the app.
6. Sign in each actor through Password auth. Use independent regular clients
   with those tokens for the public API checks. Internal/admin impersonation
   alone does not establish signed-in runtime behavior.
7. Confirm browser access and an installed, compatible native runtime before
   marking those platforms available. Record simulator model, OS, app build and
   JS source revision. A simulator result is not physical-device certification.

## Reusable backend harness

The [harness](../scripts/runtime-financial-check.mjs) runs the backend table below.
It is an opt-in destructive test of an empty disposable database, not part of
normal commit checks. It deliberately accepts only `http://127.0.0.1:33210`.
It does not bootstrap the backend, configure auth, start Metro or automate UI.

After completing the isolation prerequisites:

1. Copy the harness into the scratch checkout. Generate its internal fixture module
   **only there**, before deploying the scratch source:

   ```sh
   node scripts/runtime-financial-check.mjs --fixture-source > convex/runtimeFixtures.ts
   ```

   The module requires `RUNTIME_TEST_RUN_ID` to match the run ID. It refuses existing
   fixture roles and snapshots larger than 100 financial records. Do not deploy
   it to any shared backend. The main checkout has no runtime fixture API.
2. Use a new local instance, SQLite file and storage directory on ports 33210/33211.
   The compatible backend invocation uses `--interface 127.0.0.1`, `--port 33210`,
   `--site-proxy-port 33211`, `--instance-name`, `--instance-secret`,
   `--local-storage`, `--disable-beacon` and the task-owned SQLite path.
   Generate the local admin key with `keygen admin-key` using that same instance
   name/secret; capture it directly in a private file instead of printing it.
3. Generate an ephemeral RSA-2048 key pair. Set local `JWT_PRIVATE_KEY` (PKCS8 PEM
   with newlines replaced by spaces), `JWKS` (public JWK with `use: sig`),
   `SITE_URL=http://localhost:8081`, `ALLOW_DEVELOPMENT_REDIRECTS=true`,
   `DEVELOPMENT_REDIRECT_ORIGINS=http://localhost:8081` and `RUNTIME_TEST_RUN_ID`.
   Use the isolated backend environment API/CLI with its local admin key.
   Deploy from scratch with `convex dev --once --url` and `--admin-key`,
   `--codegen disable --typecheck disable`. Supply the key programmatically;
   do not paste it into command examples, shell history or reports.
4. Create a task-owned JSON file outside the repository, mode 600, with `url`,
   `adminKey` and `runId` properties. The URL is the literal loopback target above;
   the run ID must match `runtime-[a-z0-9-]+` and the backend variable. The harness
   refuses a nonempty financial database, unexpected URLs or a nonprivate file.
5. Run from the scratch checkout using existing dependencies:

   ```sh
   node scripts/runtime-financial-check.mjs /tmp/your-runtime/credentials.json
   ```

   Success exits zero and prints three PASS groups. Assertions require the expected
   rejection category, not merely any exception. Generated account passwords are
   retained in that private file for UI sign-in; no passwords/tokens are printed.
   Fixture seeding/snapshots use internal admin calls; financial writes, ownership
   checks and balance reads use independently Password-authenticated public APIs.
6. Run the browser/native checklist separately. Start scratch Metro with explicit
   `EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:33210`,
   `EXPO_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:33211`, `EXPO_NO_DOTENV=1` and
   `expo start --web --localhost --port 8081`. Create additional UI cards with the
   synthetic manager, and select test technicians for today's shift. Fixture
   actors are labeled Runtime 0–3; actor 0 is manager, actors 1–2 are active
   technicians and actor 3 is inactive.
7. Preserve redacted evidence, stop task processes, then remove the task-owned
   database/storage, credential file and scratch source. A failed run leaves
   partial fixtures for investigation; rerun against a new empty instance.

## Backend cases

Set total service compensation to $100 and total tip to $0 unless stated;
use Card + Gift Card methods for partial gift service. Use no supply or discount
for balance boundary/concurrency cases. Prefix every test card code with the run ID.

| Case | Action | Expected result |
| --- | --- | --- |
| Signed-in round trip | Manager creates a $105 card; active technician records $50 gift service | One saved transaction, $52.50 redemption and $52.50 balance |
| Exact balance | Other active technician records $50 gift service on the same card | Two transactions/references; balance exactly $0.00 |
| One cent over | Submit another $0.01 gift service portion | Rejected; balance, rows and references unchanged |
| Anonymous/inactive | Attempt the same recording calls without auth and with an inactive actor | Denied with no financial writes |
| Ownership | Technician edits/excludes another technician's transaction | Denied; neither row nor balance changes |
| Same-card edit | On a fresh $52.50 card, record $50 gift service, then submit that transaction unchanged | Succeeds; one transaction/reference; balance $0.00 |
| Invalid edit | Change its gift service to $50.01 | Rejected; complete original transaction, snapshot and card references unchanged |
| Invalid switch | Switch that transaction to a fresh $52.49 card | Rejected; old and new cards and original row unchanged |
| Valid switch | Switch it to a fresh $100 card | Previous card balance $52.50; new card balance $47.50; references move once |
| Gift removal | Edit to Card only with empty gift portions/code | New card returns to $100; gift link/reference removed |
| Authorized delete | Create a separate $50 gift-service transaction on a fresh $100 card, then delete it as manager | Card balance returns to $100 and reference is removed |

For every rejected request, query the stored row/card before and after; do not
infer rollback solely from an error message. Compare the full stored transaction
and references, including payRateSnapshot. Record expected and observed cents.

### Competing redemptions

Run 10 rounds, each with a new $52.50 card. Send $50 gift-service redemptions
from two distinct signed-in technician clients concurrently, without waiting
for the first response before starting the second.

For each round record:

- Both submissions started, and the number of successes and rejections.
- Exactly one success, one denial, one stored transaction/reference and $0.00 balance.
- Redacted rejection category and observed conflict/retry information, if available.

Do not report internal retry counts that were not observed. A timeout, network
failure or unrelated authorization error does not satisfy the expected balance
denial. Query final state and report the round as unresolved/failed as appropriate.
Ten successful rounds establish this bounded scenario, not all possible loads.

## Browser and iOS Simulator cases

Run these journeys separately on both platforms with the synthetic accounts.

1. Create a $200 gift card. Record $100 service with Cash + Gift Card and $40
   gift service, plus $20 tip with Cash + Gift Card and $5 gift tip. Confirm form
   remainders $60 service cash and $15 cash tip. Save and reopen the transaction.
   Gift usage is $47 ($40 × 1.05 + $5), leaving $153. With no cash supply/discount,
   overview cash collection is $75, retained cash $60, cash detail $75 and
   technician cash-tip summary $15. Verify subsequent backend queries agree.
2. Edit the service total to $120 while retaining $40 gift service and the same
   tip. Confirm $80 service cash, $15 cash tip, $95 collection and $80 retained
   cash. Gift balance stays $153. Ensure the persisted inferred cash is counted once.
3. Switch Cash + Card + Gift Card to Cash + Gift Card. Confirm explicit cash
   inputs disappear, stale values clear and remainders update. Save and reopen.
4. On a separate sufficient card, record service and gift service `1.005`; confirm
   saved service/gift amounts $1.01 and gift usage $1.06. With zero tip/supply,
   verify the card balance decreases by exactly $1.06.
5. On another fixture, use service `1.005`, fixed discount `0.10` and gift service
   `0.905`. Confirm service $1.01, gift service $0.91, discount $0.10, usage $0.96
   and successful submission. Also test a 10% discount with that gift service.
6. Try missing/unknown gift code, gift usage over balance, fixed discount greater
   than service and percentage discount over 100. Confirm useful feedback and
   no saved-record changes. Distinguish form rejection from server rejection.
7. To test server rejection and draft retention, keep a draft with a sufficient
   quote open, spend its remaining balance from another authenticated client,
   then submit the original draft. Confirm server denial, visible feedback,
   retained editable draft and unchanged original saved state. If the live query
   disables Submit before a mutation can be sent, record that as reactive form
   prevention. It does not satisfy the server-error feedback case; that case needs
   a controlled submission/interleaving or a separate fault-injection contract.

## Evidence and cleanup

For each result record source commit, target identity (no keys), platform/build,
synthetic run ID, steps, expected/observed values and redacted screenshots/logs.
Keep incomplete cases unchecked in the task record. Static exports and simulated
tests cannot substitute for these results.

Stop only task-started processes. Remove only task-owned records/scratch state;
never reset an existing deployment, erase a user's simulator or terminate unrelated
servers. Record any retained task-owned state and its purpose. Review discovered
money/auth defects before proposing a separate scoped fix.
