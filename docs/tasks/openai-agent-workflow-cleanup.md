# Task: OpenAI agent workflow cleanup

## Contract

- Status: proposed
- Authorization: user invoked `/grill-with-docs` and requested removal of files
  that are unnecessary when using Codex and ChatGPT agents.
- Outcome: the repository keeps one concise OpenAI-compatible instruction path,
  portable planning and implementation skills, and durable task records without
  Cursor- or Claude-specific workflow scaffolding.
- Owned files:
  - `AGENTS.md`
  - `README.md`
  - `.gitignore`
  - `eslint.config.js`
  - `CLAUDE.md`
  - `.cursor/`
  - `.agents/skills/glosse-task/`
  - `docs/agent-workflow.md`
  - workflow references in existing `docs/tasks/*.md`
- Out of scope:
  - application behavior, dependencies, Convex functions and generated files
  - `docs/access-policy.md` and completed task evidence
  - installed Expo and Convex skills under the ignored `.agents` cache
  - commits, pushes, deployments, migrations and ChatGPT account configuration
- Stop after: local cleanup, skill validation, reference scan and a reviewable
  handoff; do not commit or push.
- Assumptions / unresolved decisions:
  - Recommended assumption: “ChatGPT agents” means agents that can access this
    repository checkout and can share `AGENTS.md` plus `.agents/skills` with Codex.
  - Unresolved: whether a regular ChatGPT Project must also be supported with a
    separate short Project Instructions artifact.

## Acceptance criteria

- [ ] `AGENTS.md` is the only always-on repository instruction file.
- [ ] `grill-with-docs` and `glosse-task` are portable skills under
  `.agents/skills/`; neither depends on `.cursor/`.
- [ ] `.cursor/`, `CLAUDE.md` and the redundant `docs/agent-workflow.md` are
  removed after their unique guidance is preserved in `AGENTS.md` or
  `glosse-task`.
- [ ] README, task-history references, lint exclusions and ignore rules contain
  no active Cursor- or Claude-specific workflow references.
- [ ] `docs/tasks/template.md`, completed task records and domain policy remain.
- [ ] Skill validation, reference search and `git diff --check` pass.
- [ ] Existing application changes remain untouched and neither repository is
  committed or pushed.

## Implementation notes

### Keep

- `AGENTS.md`: Codex automatically loads repository instructions from this file.
- `.agents/skills/grill-with-docs/`: explicit planning workflow shared by Codex
  and compatible agent-skill consumers.
- `.agents/skills/glosse-task/`: portable implementation workflow migrated from
  `.cursor/skills/glosse-task/`.
- `docs/tasks/template.md` and `docs/tasks/*.md`: task contract and durable
  evidence.
- `docs/access-policy.md`: product and authorization policy rather than agent
  scaffolding.

### Remove or replace

- Remove `.cursor/agents/`; preserve the authorization, money and migration
  review checklist inside the portable `glosse-task` skill.
- Remove `.cursor/rules/task-workflow.mdc`; it duplicates `AGENTS.md`.
- Move `.cursor/skills/glosse-task/` to `.agents/skills/glosse-task/` and remove
  Cursor-only frontmatter.
- Remove `CLAUDE.md`; its Convex guidance already exists in `AGENTS.md`.
- Remove `docs/agent-workflow.md` after moving its necessary verification and
  review guidance into the portable skill.
- Update README, `.gitignore`, `eslint.config.js` and historical references so
  no live path points at removed files.

## Executable evidence

Pending approval and implementation.

## Review

Planning review pending. Verify that every deleted file is duplicated or migrated
before deletion and that only workflow files change.

## Handoff

Awaiting the ChatGPT-mode decision and plan approval. No cleanup files have been
removed in this planning pass.
