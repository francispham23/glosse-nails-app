# Task: Grill with docs setup

## Contract

- Status: complete
- Authorization: user approved “start setup” after reviewing the proposed
  knowledge-base and Glossé integration plan.
- Outcome: `/grill-with-docs` prepares one repository-grounded task contract and
  stops for approval before `glosse-task` implementation begins.
- Owned files: knowledge-base skill and README; Glossé `.gitignore`, `AGENTS.md`,
  `docs/agent-workflow.md`, `.cursor/skills/glosse-task/SKILL.md`, installed
  `.agents/skills/grill-with-docs/`, and this task record.
- Out of scope: product behavior, dependencies, generated application files,
  commits, pushes, deployments and migrations.
- Stop after: local installation, validation and a reviewable handoff.
- Assumptions / unresolved decisions: the shared skill remains explicit-only;
  the existing `caveman-commit` skill is unrelated and is not invoked.

## Acceptance criteria

- [x] The knowledge base contains one valid, generic `grill-with-docs` source skill.
- [x] Glossé discovers the installed skill for Cursor and Codex.
- [x] Glossé routes ambiguous planning through `grill-with-docs` and approved
  implementation through `glosse-task` without duplicate approval gates.
- [x] The skill investigates repository facts, batches only material questions,
  persists one task record and stops before implementation.
- [x] Existing application changes remain untouched and neither repository is
  committed or pushed.

## Implementation notes

Keep the shared skill independent of Glossé paths. The consuming repository's
`AGENTS.md`, workflow and task template supply project-specific policy.

## Executable evidence

- Skill structure: `quick_validate.py` returned `Skill is valid!` for the source
  and installed copies.
- Source parity: recursive diff between the knowledge-base source and installed
  Glossé copy returned no differences.
- Discovery: `npx skills list --json` reported `grill-with-docs` at project scope
  with both Cursor and Codex among the supported agents.
- Invocation: `npx skills use ... --skill grill-with-docs` produced the complete
  repository-grounded planning prompt with the implementation boundary and one
  final approval gate.
- Formatting: `git diff --check` passed in both repositories.

## Review

Self-review found no blocking issue. The skill is explicit-only by description,
keeps project policy in the consuming repository, avoids a `caveman-commit`
dependency, and routes approved work into the existing implementation workflow.

## Handoff

Local setup and validation are complete. The knowledge-base skill must be
committed and pushed before the documented private-repository install command is
available to other checkouts. Committing and pushing remain separate
user-authorized actions.
