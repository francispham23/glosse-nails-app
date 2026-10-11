# Task: Deployed web sign-in

## Contract

- Status: complete (local repair and prepared export; hosted deployment excluded)
- Authorization: user invoked debug-task for sign-in failure on https://glossenails--568nbvtf9y.expo.app/email/signin, approved with go and asked to continue.
- Outcome: deployable web export targets the intended Convex backend, and web sign-in validation/rejection is visible with retry and draft preservation.
- Owned files: package.json; a focused web export/configuration checker in scripts/; auth email/signin.tsx; focused sign-in/checker tests; deployment guidance and this record.
- Out of scope: changing backend auth/ACL, credentials, remote environments, native behavior, signup/reset flows, dependency changes, commit/push/deploy.
- Stop after: local fixes, meaningful tests, production export proof, self-review and handoff of export/deployment command. Hosted deployment requires separate authorization.
- Baseline: preserve all staged and unstaged Landing/theme/Settings/password/test work. Synthetic quality exports intentionally use example.convex.cloud and must remain supported as verification artifacts.
- Target: existing local development backend rapid-guineapig-653 used for a prepared export, stated to user before export. No production target, environment mutation or deployment implied.
- Verification: checker rejects missing/placeholder deployment URLs on deployable export; synthetic quality exports remain available separately. Sign-in tests cover empty input, rejected auth, draft preservation/retry and success with unchanged auth contract. Full quality gate, synthetic platform export, docs/diff checks. Production export uses selected backend only after target approval; isolated auth/browser success remains separate from hosted-account proof.

## Acceptance criteria

- [x] Deployable web export refuses example.convex.cloud and uses explicitly selected real backend: CLI/unit guard and development bundle inspection.
- [x] Empty email/password and rejected credentials display readable web feedback; rejected drafts retained and retry enabled: four interaction tests and local browser proof.
- [x] Native Alerts and Password signIn parameters preserved; existing valid isolated login succeeds: native validation test, unchanged Password contract and local Runtime 0 login reaches Earnings.
- [x] Local checks, browser/export evidence and hosted-verification limits recorded below.

## Executable evidence

- Inspected the named hosted preview in Chrome. Empty Sign In produces no visible error. Source uses React Native Alert, which has no web implementation.
- Submitted one synthetic nonexistent identity, without user credentials or account creation. Browser reports [CONVEX FATAL ERROR] Couldn't parse deployment name example. Signing In stays pending, confirming unusable bundled endpoint rather than incorrect real credentials.
- Existing CI/workflow quality exports use EXPO_PUBLIC_CONVEX_URL=https://example.convex.cloud intentionally for bundle checks. Those outputs cannot authenticate and must not be deployed as functional previews.
- Expo docs https://docs.expo.dev/guides/environment-variables/ confirm EXPO_PUBLIC variables are inlined during export. Changing hosting variables after export cannot repair the existing bundle; fresh export required.
- eas.json production build env has a real Convex URL, but native build-profile env does not establish which URL a separate local web export used.
- React hydration error #419 also appeared during interaction; sign-in dispatch proceeded and endpoint fatal error is the confirmed blocker. No unrelated hydration/auth-policy repair proposed without further evidence.

## Review and handoff

Implementation approved. Guarded export requires explicit cloud deployment URL, disables dotenv and rejects placeholders/unsafe URLs. Validation checks shape, not backend health. Synthetic quality exports remain separate. Web sign-in uses inline accessible feedback; native Alert retained; rejected values retained; Convex stack details mapped to readable errors. No real-account login attempted.

## Implementation verification

- Final quality passed: 115 backend tests, 147 app tests in 17 suites, 2 node export-guard tests, typechecks and both lint surfaces. First typecheck found a Jest afterEach returning Jest instead of void; repaired and reran full gate successfully. Biome and direct ESLint on changed scripts passed.
- CLI regression: npm run export:web -- --convex-url=https://example.convex.cloud exits 1 before invoking Expo. Unit cases reject absent, synthetic, loopback, credential-bearing and path-bearing URLs; named HTTPS Convex URL normalizes correctly.
- Browser final proof /private/tmp/glosse-signin-final: identified disposable Expo web/loopback backend 127.0.0.1:33210, synthetic missing identity produces visible Invalid email or password feedback with values retained and button enabled; retry with seeded Runtime 0 account reaches Earnings. Earlier validation screenshot /private/tmp/glosse-signin-feedback/validation.png shows required-email alert. Native Alert preservation verified by interaction test; native device/OAuth not exercised.
- Self-review found raw Convex stack appearing in initial web error, repaired with readable invalid-credential/generic Convex messages and added a regression. Final rejection screenshot /private/tmp/glosse-signin-final/rejection.png. Console diagnostic remains; development LogBox may appear in disposable runtime, not release UI.
- Owned runtime cleanup passed, tab closed and synthetic credentials/scratch removed. No production accounts/data used. No remote environment/deployments or backend auth/ACL changes.
- Prepared functional development export uses rapid-guineapig-653 as stated to user. Export and bundle destination result below; no hosted sign-in proof claimed.
- Guarded web export passed at /private/tmp/glosse-deployable-preview. Inspected its generated entry bundle: selected development URL present, placeholder and production URL absent. This proves bundled destination, not hosted backend/account readiness. Separate synthetic all-platform export passed at /private/tmp/glosse-signin-quality-export; that directory remains verification-only and must not be deployed.
- Final docs checker and diff check passed. Self-review of current SignIn source, guard/tests, package commands and guidance: only presentation and export validation changed; no auth/ACL/session/backend changes. Preserved user formatting/staged work and Landing/theme fixes. No staging, commit, push, remote environment mutation or deployment performed.
- Handoff: deploy a fresh functional export as a separately authorized release step, then verify the named hosted preview with an authorized account. Existing hosted site still uses the bad old bundle. Do not claim the preview is fixed until it receives the new output.
