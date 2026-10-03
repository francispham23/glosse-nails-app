# Design and change impact

Read for a shared interface, lifecycle/state transition, data format or storage
change, or a design whose placement is genuinely contested. Routine content edits
do not need this analysis. [Source and adaptation notes](upstream/README.md).

## Before editing

- Identify the actual changed state and its intended observable behavior. Trace
  affected callers and user entry points, including create/edit/report consumers.
- Follow what a symbol search misses: persisted values, API payloads, event/order
  assumptions, subscription refresh, microtasks, unmount/teardown and native versus
  web lifecycle. Check the pinned library source or local patch for disputed behavior.
- State the critical assumptions that make the change safe. Label each as supported
  by source, traced failure path, executable check or actual runtime evidence.
  Separate confirmed risks, checked-and-cleared cases and unproven assumptions;
  avoid invented callers or numerical risk estimates without evidence.
- While planning, put proposed proof and owned files in the contract. Execute or
  add a proof only inside approved implementation/verification scope. Prefer an
  existing check; add a small reproducible check when it answers a material question.
  Source reasoning alone cannot close acceptance that requires runtime evidence.

## When interface design needs work

Judge an interface by what callers must understand: inputs, ordering, invariants,
failure modes and configuration, not only its TypeScript signature. A useful module
hides real complexity that would otherwise spread across callers. Reduce that
burden where recurring complexity or a demonstrated testability problem warrants it.
An extra wrapper or adapter earns its place only when behavior actually varies.

Use the repository's component/API vocabulary. A useful local refactor need not
introduce a new layering scheme or generic abstraction. Boundary parsing, explicit
state variants and exhaustive handling can clarify a real failure; types do not
prove caller identity, active role or stored ownership. Keep Convex generated types
and runtime validators as their existing authoritative sources.

## Proof and review

Prove material assumptions with the smallest meaningful test/reproducer using real
code; record expected and observed results and the evidence level reached. For
financial/access changes, use existing policy and [testing guidance](testing.md),
including independent expected values and persisted-state/rollback checks. Preserve
relevant caller coverage and existing tests; replacement/removal requires approved
scope and evidence that equivalent behavior remains covered.

If a design remains contested, explain the alternatives and trade-offs in the task.
Use a separate read-only reviewer only when available and authorized, with the actual
snapshot and evidence. This reference starts no arena, swarm, worktree operation or
release action. Finish through [the existing review](review.md) and task handoff.
