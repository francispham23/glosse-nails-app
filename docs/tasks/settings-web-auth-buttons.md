# Task: Repair Settings web auth buttons

## Contract

- Status: complete
- Authorization: user requested debug-task for Reset Password and Sign Out failing on web; written plan approved by user with "go".
- Outcome: both Settings buttons work on web with confirmation, cancellation and visible failure feedback.
- Owned files: app/(root)/(main)/settings.tsx; focused Settings interaction tests; this record. A Settings-specific dialog component only if needed.
- Out of scope: backend/auth policy changes, forgotten-password email screens, unrelated Alert callers, dependencies, deployment.
- Stop after: local checks, scoped self-review and handoff; no commit or push.
- Verification plan: failing regression and focused interaction tests; npm run verify:quality; git diff --check; synthetic all-platform Expo export per agent-workflow; isolated browser smoke for confirmation, cancellation and form validation. Report any unavailable live-auth evidence separately.
- Baseline: clean working tree, implement-web-app at 7f24cd5.
- Assumptions: Reset Password refers to the Settings button adjacent to Sign Out; retain its existing current-password change flow and existing confirmation text.

## Acceptance criteria

- [x] Web Reset Password opens a confirmation; confirmation opens the existing change-password form, cancellation leaves Settings unchanged.
- [x] Password validation and success/failure feedback are visible on web; rejected saves retain password inputs for retry.
- [x] Sign Out cancellation does not sign out; confirmation invokes signOut once, holds pending state until settlement and shows failures with retry available.
- [x] Native confirmation behavior remains functional.
- [x] Relevant tests, completion checks, export and self-review recorded; browser runtime evidence or explicit deferral recorded.

## Implementation notes

Use React Native Paper dialogs for web confirmation and feedback, retaining native alerts. Await signOut and manage pending/error state around the actual request.

## Executable evidence

- Source diagnosis: both Settings actions run only inside Alert.alert confirmation callbacks.
- Installed node_modules/react-native-web/dist/exports/Alert/index.js implements static alert() as an empty method. This proves neither callback executes on web.
- Primary documentation agrees: https://necolas.github.io/react-native-web/docs/react-native-compatibility/ lists Alert as unsupported.
- Separate email reset routes have commented-out submit logic and are excluded from this Settings repair.
- No product edits or runtime auth actions performed during diagnosis.

## Review

Self-review of Settings route and focused tests at base 7f24cd5, with final SHA-256 fingerprints:
- Settings: a4b49dc5d7ced2cbd61a92e3b63825481e1e779390c36f3bd8eb46cfb4ab9d91
- Test: 7bf1448770c4ca88600448e8fbacd4119556c769ab85bbf609fab0302342fabe

Reviewed callback ordering, cancellation, request settlement, failure draft retention and platform branches. No outstanding findings. No backend/access policy changes. No delegation authorized.

## Handoff

Implemented and locally verified; no commit, push or deployment. Native device and production behavior remain unverified. Password action success/failure uses mocked external action boundaries in interaction tests; no browser credential change performed. Separate unfinished email reset screens remain out of scope.

## Final evidence

- Regression initially failed with missing reset confirmation after fixture setup was corrected (Reanimated view substituted only; actual Settings/Paper interaction logic retained).
- Focused Settings tests: 5 passed. Covers reset confirmation/form, both cancellations, deferred sign-out/rejection/retry, password validation/rejection/draft retention/success and native Alert callback.
- `npm run verify:quality`: passed typechecks, backend lint, 115 backend tests, full app lint and 139 app tests (14 suites). Initial new-test type errors repaired before final passing gate.
- Synthetic all-platform Expo export per workflow: passed; output `/private/tmp/glosse-settings-export`.
- `git diff --check`: passed. `node scripts/check-agent-docs.mjs`: passed.
- Browser: Chrome, Expo development web, disposable local Convex `http://127.0.0.1:33210`, synthetic Runtime 1 actor, evidence `/private/tmp/glosse-settings-auth-proof-3`. Doctor passed identity checks. Source fingerprint 7befed0c6fd39e097ecd36bba83a44530fbb6109366eb8c199f3109bd09566ac.
- Observed reset confirmation cancellation returning to Settings; confirmation opening current/new/confirmation inputs; empty submission showing visible current-password validation. Screenshot password-validation.png retained.
- Observed sign-out cancellation preserving Settings/session; confirmed sign-out returning to unauthenticated root with Google/Email sign-in choices. signed-out-ui.txt and signed-out.png retained.
- First sandbox launch could not bind loopback. Approved escalation ran runtime. Initial runtime Metro encountered ENOTEMPTY shared-cache contention during concurrent export; retry after export succeeded. Owned cleanup passed, all three ports free, scratch/credentials removed.
- Acceptance mapping: first item covered by focused tests and browser; second by focused action-boundary tests and browser validation; third by focused deferred/failure tests and browser cancellation/success; fourth by native-branch test plus all-platform exports (device smoke unverified); fifth by final checks, scoped self-review and retained runtime proof.
