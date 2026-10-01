# Task: Phase 1 authorization

## Contract

- Status: complete (local implementation, verification and review; not deployed)
- Authorization: user approved phase 1 and requested the agent workflow first.
- Outcome: protected backend reads require active staff; technicians cannot read
  or edit another technician's financial records by manipulating request fields.
- Owned files: agent/workflow documentation; package scripts/lock; Vitest config;
  Convex authorization functions and tests; redirect-policy helper and tests;
  minimal gift-card display adjustments required by the scoped-history response.
- Out of scope: tenant/money schema migration, financial calculations, UI redesign,
  full lint cleanup, CI/release automation, generated code edits and deployment.
- Stop after: tested local patch, review and handoff; no commit/push/deploy.
- Policy: no public kiosk endpoint is authorized. Active staff can see the shift
  directory, categories and gift-card lookup; financial lists/details are self-only
  for technicians and full access for owners/managers. Management writes remain
  owner/manager-only. Authentication/bootstrap remains intentionally public.
- Existing financial calculations and query pagination remain later-phase work.

## Acceptance criteria

- [x] Anonymous, roleless and inactive callers cannot read operational records,
  including today's transactions with report omitted/false.
- [x] Technicians receive only their own financial results regardless of report
  flag; owners/managers retain access. Details cannot bypass list restrictions.
- [x] Technician A cannot edit B's record by sending A's ID or reassign their own
  record to B. Owners/managers may reassign and successful self edits still work.
- [x] Management mutations deny non-management callers and still work for both
  owner and manager; rejected writes leave existing records unchanged.
- [x] Anonymous viewerAccess still supports bootstrap without operational data.
- [x] Callback policy rejects lookalike hosts, credentials and broad web-scheme
  allowlisting; explicitly configured native/web callbacks remain valid.
- [x] Password changes require the authenticated caller to own the password
  account; another caller's email cannot redirect credential changes.
- [x] Backend checks pass; existing app lint failures are reported separately.
- [x] Excluding a transaction from a gift-card balance requires self/management
  access. Changing the selected card for an owned transaction still works.
- [x] Gift-card Total Used uses the shared card balance, not the self-only history;
  the history label makes the scope clear to technicians. Verified by source
  review, types, backend data regression and targeted lint; not device-rendered.

## Implementation notes

Workflow setup precedes backend edits. Use the existing authz helpers and preserve
public API argument shapes. Do not add production credentials or a test deployment.

- Added concise root guidance, one always-on rule, an on-demand task skill,
  implementer/reviewer definitions, workflow guide, task template and access policy.
- Added Vitest, convex-test and the edge runtime with executable package commands.
- Protected operational queries and both sides of transaction reassignment using
  existing auth helpers. Added return validators and projected shift directory data.
- Kept auth bootstrap and account-owner password maintenance intentionally accessible
  without an active operational role. Password provider operations are mocked only
  in the password test suite; the ownership comparison and caller parsing are real.
- Callback allowlisting now uses exact parsed origins, explicit native schemes and
  opt-in development origins. See [configuration](../access-policy.md) before release.
- Review identified gift-card inference and display regressions. Added ownership
  checks for excluded transactions and a small display fix. An owned transaction
  can still switch gift cards; no unrelated finance calculation was changed.

## Executable evidence

Final verification: 2026-09-23. Baseline/regression work began 2026-09-22.

- Initial authorization suite against the original implementation: 8 failed,
  11 passed after correcting the test module glob. Failures reproduced public
  reads, unscoped lists/details and spoofed transaction ownership.
- Callback suite against the original implementation: 11 failed, 7 passed,
  including accepted lookalike hosts and overly broad scheme trust.
- Review regression: nonzero gift redemption test failed because another
  technician could exclude the redemption and obtain a different balance.
- `npm run verify:backend`: PASS — app and Convex TypeScript checks, zero-warning
  backend ESLint, and 42 tests across three files (21 authorization, 18 callback,
  3 password). No live backend or production data used.
- `eslint components/Gift/bottom-modal.tsx components/Gift/transaction-history.tsx
  --max-warnings 0` using the local binary: PASS.
- `CI=1 npm run lint`: FAIL — 18 errors and 1 warning, matching the before-change
  baseline. Existing frontend render-purity/effect/display-name issues remain;
  no rule was disabled or baseline hidden to make this task pass.
- Agent configuration check: PASS — four frontmatter files parse, required
  metadata is present, instruction sizes are bounded and local documentation
  links resolve. The custom reviewer instructions were exercised in a real review.
- `git diff --check`: PASS. Schema and generated Convex files unchanged.
- Not run: live Convex push, device/browser rendering, OAuth provider integration,
  production migration or release. This patch's authorized stopping point is local.

## Review

Independent `phase1_review` agent followed `.cursor/agents/glosse-reviewer.md` and
the Convex reviewer checklist. Initial findings:

1. P1: arbitrary `getByCode.transactionId` could reveal another technician's
   redemption. Fixed with stored ownership check and nonzero regression tests.
2. P2: filtered gift history made Total Used incomplete. Fixed by deriving the
   displayed total from the shared balance and labeling self-only history.

Focused re-review: both resolved, no remaining blocking findings in reviewed
scope. Reviewer independently ran all 21 authorization tests successfully.
Staff-wide gift catalog access is explicit in the access policy. UI rendering,
deployed OAuth and inactive/roleless navigation remain untested release checks.

## Handoff

The approved local phase is complete. Changes remain uncommitted for user review.
No commit, push, deployment, schema migration or environment modification occurred.

Remaining work: full app lint cleanup and CI (phase 2), business tenancy (phase 3),
server financial invariants and audit history (phase 4), and user-journey/release
work. Existing unbounded reporting queries and money calculations are unchanged.
Inactive or unapproved accounts are denied operational APIs; polished navigation
and access-denied screens still need integration validation.

Before any deployment, verify the callback environment on an authorized preview
backend and exercise real sign-in/logout and each affected role. EAS build env
does not set Convex backend env. Broader implementation or deployment needs its
own user instruction; do not infer it from this completed task.
