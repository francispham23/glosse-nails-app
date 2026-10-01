---
name: glosse-task
description: Implement or resume one approved Glossé app task using its existing contract, relevant verification and reviewed handoff.
---

# Glossé Task

Read the repository [AGENTS.md](../../../AGENTS.md), [workflow](../../../docs/agent-workflow.md)
and supplied task record. Use [the template](../../../docs/tasks/template.md)
when no record exists. An approved contract authorizes its implementation;
resume that contract without asking again. Resolve only material scope or product
decisions through grill-with-docs before dependent edits.

Inspect Git and affected callers before editing. Own only the approved files;
preserve existing work and generated outputs. Use one writer per changed surface.
For money changes read [financial policy](../../../docs/financial-policy.md);
for authorization read [access policy](../../../docs/access-policy.md).
For Convex edits first read convex/_generated/ai/guidelines.md and relevant schema.

Implement the agreed behavior and assert explicit acceptance results. For a bug,
establish the failing regression where practical, fix the cause and rerun it.
Do not compute expected financial results using the helper under test.

Choose targeted checks, then the completion gate using the workflow. Record
actual failures and unexecuted checks; local simulated tests and exports do not
establish device, live-backend or release readiness.

For authorization, money or migration changes, request an independent read-only
review using [review guidance](references/review.md) when delegation is available
and authorized. Otherwise label self-review. Give the reviewer the contract,
actual changed state and evidence; repair findings and rereview material fixes.
If the same failure survives three materially different attempts, reassess cause
and scope instead of expanding the task silently.

At handoff, update each acceptance item with evidence or an explicit deferral.
Record changed behavior, review/resolutions, remaining limitations and the next
authorized step. Stop at the contract boundary; commits, pushes, deployments,
credential changes and data migrations require separate authorization.
