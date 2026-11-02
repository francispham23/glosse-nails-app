# Behavioral testing

Read when implementing observable behavior or a regression that warrants tests.
Use the approved contract's interfaces and acceptance cases; routine test choices
inside that scope need no repeat approval. A new business decision or broader
behavior change goes back to the contract. [Source/adaptation notes](upstream/README.md).

## Choose a meaningful boundary

Exercise the interface used by a caller or user and assert the observable result.
For backend authorization, call actual functions with synthetic identities; a UI
guard is not API proof. For UI interactions, drive the real interaction through the
existing app test tools. Use configured Jest/RNTL or Vitest/convex-test discovery
paths and current package scripts rather than introduce a second harness.

Keep domain, calculation and authorization logic real. Substitute external systems
at their existing isolation boundary when necessary, and say what the substitute
prevents the test from proving. Framework adapters can support isolated app tests;
a simulated backend or mocked native module is not live-backend/device evidence.

## Establish the failure, then repair

For a bug, first establish a meaningful red test/reproducer when practical. Confirm
it fails for the intended behavior rather than fixture/setup failure. Fix that cause,
rerun the original check, then cover the next required behavior as another small
slice. Avoid a bulk suite for imagined implementation shapes or tests that merely
match the new code. If a meaningful local red check is unavailable, record the
attempt and missing precondition; keep the required runtime acceptance unverified.

Use explicit expected values from the approved policy, worked example or independent
oracle. Do not obtain expected financial results from the helper under test or
recompute the same implementation. Assert denied/failure paths and recovery as well
as success when the contract requires them.

## Stored effects and coverage

Pair visible outcomes with required persisted effects. Rejection/rollback can require
unchanged stored state as well as a retained draft; acknowledgement retry must not
silently create another mutation. Read-only stored-state assertions are legitimate
financial/access proof even when public-interface checks also exist. Inspect relevant
create/edit/delete/report consumers, ownership and foreign-key paths against the
existing [financial](../../../../docs/financial-policy.md) and
[access](../../../../docs/access-policy.md) policies.

Preserve existing tests and behavior coverage. Remove/replace a test only within
approved scope after showing equivalent relevant coverage, not simply because its
module became internal. Avoid new tests for reversible low-impact instruction/content
edits when structural validation and review suffice.

Run targeted checks during iteration and the applicable completion gate from the
[workflow](../../../../docs/agent-workflow.md). Record actual command results and gaps.
Separate local/simulated checks, exports, real user-path runtime and production
evidence; neither a green test nor a bundle substitutes for a required device check.
