# Task: \<short name\>

## Contract

- Status: proposed / in progress / ready for review / complete / blocked
- Authorization: user's request and accepted scope
- Outcome: one concrete behavior
- Owned files:
- Out of scope:
- Stop after:
- Verification plan: targeted commands, completion checks and required runtime evidence
- Baseline: branch/revision, existing work to preserve, existing failures
- Assumptions / unresolved decisions:

## Acceptance criteria

- [ ] Given ... when ... then ... (allowed path)
- [ ] Given ... when ... then ... (denied/failure path)

At handoff, attach evidence to each item. Leave unmet items unchecked and explain
the deferral, impact and next action. Deferred required work prevents "complete".

## Implementation notes

Record decisions that affect behavior, compatibility or migration.

## Executable evidence

Record each relevant command, result and what it establishes. Include failing
regression evidence, final checks, existing failures and unexecuted checks.

Separate local simulated tests/bundle exports, preview/runtime verification and
production release. For runtime evidence include platform/build, synthetic
fixture, backend target and expected/observed result, without credentials.

## Review

Reviewer, scope, findings and resolutions. Explicitly label self-review if used.
Identify reviewed revision or working-tree fingerprint and relevant untracked
files. Rereview material changes made after that snapshot.

## Handoff

Changed behavior, remaining risks, next authorized action, and exact stopping point.
