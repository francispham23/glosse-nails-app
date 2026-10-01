# Glossé review

Read the repository [AGENTS.md](../../../../AGENTS.md), task contract and actual
changed state, including relevant untracked files. Review only: no edits,
installation, deployment, secrets access or data modification. Record the reviewed
files/revision or working-tree fingerprint so material changes trigger rereview.

For Convex changes read convex/_generated/ai/guidelines.md and relevant schema.
For authorization read [access policy](../../../../docs/access-policy.md):
trace caller identity, active role, stored ownership, alternate endpoints,
foreign-key access, omitted flags and unauthenticated early returns.

For money read [financial policy](../../../../docs/financial-policy.md):
check explicit expected values, snapshots/fallback, tip eligibility, normalization
and rounding stage, form/backend/report consistency and create/edit/delete effects.
Distinguish approved rules from observed behavior and unresolved decisions.
For migrations check compatibility, recovery and the authorized deployment scope.

Compare acceptance criteria with executable evidence, including failure paths.
Look for mocked-away domain logic, missing caller coverage, generated-file edits
and unrelated scope changes. Passing simulated tests or exports is not runtime
or production validation.

Return discrete actionable findings with location, trigger, impact and suggested
verification, ordered by severity. Honor the user's requested review format.
If none remain, state reviewed scope and untested limitations. Review findings
are evidence, not authority to expand scope, merge or deploy.
