# Task: Shared companions for grill-with-docs

## Contract

- Status: complete locally; shared skills installed, checked and self-reviewed.
- Authorization: user invoked grill-with-docs to research and suggest a complete
  coding workflow for 2026; research must precede questions and recommendations.
  User subsequently approved implementation and requested guidance at each
  stage, including recommendations whenever their input is necessary.
- Outcome: a small, shared Codex workflow that carries one researched and approved
  contract through implementation, debugging, verification, review and handoff.
- Owned files: this task record and new user-scoped directories under
  /Users/francispham/.codex/skills/implement-task/, debug-task/, verify-task/,
  review-task/; each needs SKILL.md and concise agents/openai.yaml metadata.
  Minimal changes to shared grill-with-docs/SKILL.md and agents/openai.yaml clarify
  research, companion routing and explicit-only planning behavior.
  Implementation evidence remains in this record.
- Out of scope: product code, project dependencies, environment/configuration,
  global AGENTS.md, memory edits, project skill deletion/rewrites, third-party
  tool installation, persistent E2E suites, CI/protection changes, unattended
  automation, commits, pushes, PR publication, migrations and deployments.
- Stop after: installed and locally validated shared instruction skills, evidence
  and reviewed handoff. Runtime tools and release automation are later tasks.
- Baseline: 2026-10-02, branch update-expo-57, HEAD
  762b898a2546c241ab83d8cc8f0e529d563f158d. Existing user change:
  convex/_generated/api.d.ts; SHA-256
  eebf2df6c8d25e0f28321d6426f3a47536a779381e85912d26ae99ee5e24fefa.
- Assumptions: Codex is the initial target. Shared procedures discover the current
  repository's instructions, package manager, task format and commands. They
  defer to a repository-specific implementation skill such as glosse-task when
  present; repository policies remain local. Cursor/Claude compatibility beyond
  portable Markdown is not claimed. No additional product decision is needed
  before reviewing this proposal.

## Acceptance criteria

Research and planning:

- [x] Inspect current planning/implementation/review guidance and prior related
  task records before recommending replacements.
- [x] Check current primary documentation, upstream skill instructions and 2026
  empirical research; distinguish recommendations from proven local outcomes.
- [x] Separate existing, installable upstream and proposed custom skills.
- [x] Identify overlaps, tool assumptions and approval conflicts before proposing
  installation; preserve the existing generated-file change.

Approved implementation:

- [x] Shared skills contain no hard-coded Glossé paths, npm-only commands or
  assumptions that Cursor-specific tools exist.
- [x] An approved task resumes from its record without another implementation
  approval; materially changed scope or policy returns to the planner.
- [x] Research covers repository facts and current primary sources relevant to
  uncertain/version-sensitive questions before asking the user. Missing evidence
  is disclosed. Research stops when the decision-relevant uncertainty is resolved.
- [x] Debugging reproduces the failure, tests a stated hypothesis and protects
  meaningful behavior with a regression when practical; diagnostics redact data
  and credentials. Repeated failed approaches trigger reassessment.
- [x] Verification maps acceptance items to actual commands/runtime observations
  and the checked state. Existing evidence may be reused only for unchanged
  relevant inputs with provenance; subsequent changes invalidate affected checks.
- [x] Review covers committed, staged, unstaged and relevant untracked task work
  as applicable; fixes require review of the updated state. Independent review is
  used only when available and authorized; otherwise clearly label self-review.
- [x] Runtime checks identify build/platform/backend/fixture and observed behavior;
  unavailable tools or environments produce an explicit deferral, never a pass.
- [x] No skill grants itself release, data-migration, external-comment or global
  configuration permissions. Stop at the approved handoff boundary.
- [x] Metadata, references and realistic positive/negative invocation scenarios
  are checked in isolated fixtures; preserve both existing repositories.
- [x] Each stage explains the next action when useful; required input requests
  state the investigated uncertainty, recommended choice and consequences.
  Routine transitions within approved scope continue without another question.

## Research findings and recommendation

This is a design recommendation, not a measured speed or defect reduction claim.
Skills are instructions. The available tools, isolated environments, tests and
CI implement the workflow; merely installing Markdown does not supply them.

### Five core skills

| Stage | Skill | Source/status | Responsibility |
| --- | --- | --- | --- |
| Research and plan | grill-with-docs | Existing project and shared copies | Repository facts and current evidence, one contract, material questions, approval |
| Implement and resume | implement-task | Installed original generic skill informed by local glosse-task | Execute approved scope, select repository guidance, preserve work, record progress |
| Investigate failures | debug-task | Installed original skill informed by systematic debugging techniques | Reproduction, evidence, hypothesis, narrow fix, relevant regression |
| Establish completion | verify-task | Installed original skill informed by local workflow and evidence discipline | Targeted checks then repository gate; acceptance/evidence mapping; runtime routing |
| Review and repair | review-task | Installed original generic skill informed by local review guidance | Contract compliance and correctness, risk-specific review, actionable findings, rereview |

Handoff/resume belongs in implement-task and the same task record. A separate
handoff skill or second task ledger would add duplication without a demonstrated
need. Domain guidance is loaded only for the affected stack, not for every task.

Normal flow: grill-with-docs -> approval -> implement-task -> verify-task ->
review-task -> scoped repairs and affected checks/review -> evidence-based handoff.
debug-task is entered when evidence exposes a failure. For changed user journeys,
verify-task includes the contracted browser/device/API runtime checks. A local-only
contract can finish with declared runtime limits; a required runtime check cannot
be silently waived. Release is a separately authorized stage.

### Upstream skills worth borrowing or adding conditionally

- [systematic-debugging](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md):
  strong root-cause sequence and focused hypothesis testing. Its sibling skill
  dependencies and environment/signing diagnostic examples need adaptation for
  this computer; do not log credentials or automatically inspect keychains.
- [verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md):
  useful evidence discipline. Adapt freshness to the verified source state rather
  than requiring a full rerun merely because a new chat message is emitted.
- [test-driven-development](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md):
  use failing-then-passing behavior tests for meaningful logic and bug fixes.
  Its blanket test-first and delete/rewrite requirements should not be imported
  as global policy for existing work, generated files, docs or simple UI edits.
- [OpenAI playwright](https://github.com/openai/skills/blob/main/skills/.curated/playwright/SKILL.md):
  optional browser exploration and evidence. The inspected skill explicitly
  defaults to CLI automation, not Playwright Test files. A durable browser suite
  is a separate implementation using [Playwright Test agents](https://playwright.dev/docs/test-agents).
- [agent-device](https://docs.expo.dev/agents/agent-device/): optional official
  Callstack skill documented by Expo, operating installed apps on simulators and
  emulators. Installable source: callstack/agent-device. Tool availability,
  installed builds and synthetic backend fixtures still need their own setup.
  [Maestro in EAS](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)
  is another repeatable native E2E path; avoid installing multiple overlapping
  runtime stacks before a concrete acceptance journey establishes the need.
- [gh-fix-ci](https://github.com/openai/skills/blob/main/skills/.curated/gh-fix-ci/SKILL.md):
  optional GitHub Actions log diagnosis and scoped repair. It requires gh access
  and includes its own approval step; integrate with an existing contract to
  avoid repeating an already granted approval. It does not cover all CI vendors.
- [security-best-practices](https://github.com/openai/skills/blob/main/skills/.curated/security-best-practices/SKILL.md):
  optional explicit security review for supported languages/frameworks. It is
  not a replacement for the consuming repository's domain authorization policy.
- Existing Vercel, Expo and Convex guidance supplies domain expertise. The current
  [Vercel catalog](https://github.com/vercel-labs/agent-skills) and
  [Expo catalog](https://docs.expo.dev/skills/) differ from several installed skill
  names. Audit/pin revisions before any separate update rather than assuming
  the cached local catalog is current. No updates are part of phase 1.

For discovery, skills.sh entries for systematic-debugging and
verification-before-completion were reachable. Two cached CLI searches using
npx --no-install skills find produced no output and were interrupted. Candidate
assessment relied on fetched upstream instructions, not an assumed CLI result.

### Compatibility issues found locally

- glosse-task already implements most execution/resume/handoff requirements,
  but its relative repository links make copying it unchanged into user scope
  incorrect. Generalize its discovery while preserving its local specialization.
- Installed review/review-bugbot/review-security require Cursor-style AskQuestion,
  bugbot/security-review subagent types and arguments unavailable in this Codex
  session. A skill file being installed does not prove those agents can execute.
- Installed autopilot and babysit overlap. autopilot is more explicit about live
  PR state and scoped fixes, but its loop includes commits/pushes and external
  review replies. Keep PR operation optional and explicitly authorized later.
- Superpowers brainstorming/writing-plans duplicate the planner; executing-plans
  uses its own plan/ledger/scripts, commit steps and sibling skills. Adopt selected
  techniques rather than nesting the entire workflow under grill-with-docs.
- The staff app uses npm, Jest/jest-expo and Vitest/convex-test. The marketing
  site's AGENTS.md requires pnpm, Vitest, typecheck and ESLint. A shared skill
  must discover these differences. No global npm verification command is valid.
- Current inspected app paths contain no established Playwright or Maestro suite.
  Existing simulated tests and bundle exports do not establish runtime UX.

### 2026 evidence and its limits

- [OpenAI harness engineering](https://openai.com/index/harness-engineering/)
  supports maintained repository knowledge, concise routing instructions and
  executable constraints. It describes one team's engineering experience,
  not a controlled proof that a particular skill bundle is optimal.
- [OpenAI September 11 guidance](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)
  recommends precise descriptions, progressive disclosure and removing conflicting
  or unnecessarily elaborate instructions. This supports a small core here.
- [Anthropic March 24 harness experiment](https://www.anthropic.com/engineering/harness-design-long-running-apps)
  connects explicit completion contracts to application QA, and later simplifies
  scaffolding as model capabilities improve. Reviewer benefit depends on task
  difficulty; it does not justify a reviewer agent after every tiny edit.
- [Evaluating AGENTS.md, September 29 revision](https://arxiv.org/html/2602.11988v3)
  reports increased cost without general task-resolution improvement in its
  tested conditions. Its evaluation focuses on Python and task resolution;
  it does not establish the same outcome for this Expo/Convex app or security.
- [SkillsBench, June revision](https://arxiv.org/html/2602.12670v4) reports gains
  from curated skills in its terminal-task benchmark, with focused skill content
  outperforming exhaustive bundles. This is not a rule that exactly three skills
  must be installed, nor proof that this proposed five-stage workflow will win.
- [SWE-Skills-Bench](https://arxiv.org/abs/2603.15401) reports limited average gains
  from most tested SWE skills and identifies version/context mismatch as a
  failure mode. Together these studies argue for measured, contextual adoption;
  their results are not directly comparable because tasks and setups differ.
- [OpenAI skill evals](https://developers.openai.com/blog/eval-skills) recommends
  realistic trigger/non-trigger cases and checking actual artifacts. The
  [Agent Skills specification](https://agentskills.io/specification) supplies
  portable structure and progressive disclosure, not execution permissions.

The workflow also needs real enforcement outside prompts: tests/CI and, where
configured, [required protected-branch checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
Remote protection settings were not inspected or changed in this research pass.

## Implementation notes

Wrote original concise instructions using the local workflow as precedent;
no upstream bundle, scripts or substantial upstream text were copied. If future
changes copy substantial upstream resources, preserve their license attribution
and selected immutable revision. New generic
names prevent silent collisions with installed vendor skills. Do not install
the full Superpowers bundle or delete existing skills.

Keep grill-with-docs explicit-only. Other core companions can use normal precise
discovery, constrained by approved scope and repository guidance. Availability
in the shared directory permits invocation across repositories; it does not
force every agent or every editor to use the workflow. No global rule change
is proposed.

## Verification plan

Planning pass: agent-document checker, git diff --check, focused self-review,
read-back of this record and baseline fingerprint preservation. Product checks
are not required for creating this Markdown planning record.

After approval: validate new/changed skill frontmatter/UI metadata and referenced
resources using available validators; record unavailable validator dependencies
and any alternative precisely. Evaluate isolated synthetic scenarios covering:
ambiguous work without approval; approved resume; relevant bug reproduction;
unrelated user diff; npm versus pnpm; failing completion gate; stale evidence;
unavailable runtime tool; self-review fallback; external/release scope boundary.
Check outcomes and artifacts rather than exact prose. Record which scenarios
were actually exercised and whether an independent model evaluation occurred.
No independent subagent work is authorized by this research request.

Measure accepted task outcomes, review rework, escaped defects, elapsed time and
cost on comparable real tasks before adding orchestration or unattended loops.

## Executable evidence

- `node scripts/check-agent-docs.mjs`: PASS; 13 canonical/compatibility files,
  39 local links and 19 npm command references. This checker does not cover
  every historical task record or certify external links.
- `git diff --check`: PASS for the existing tracked diff.
- `git diff --no-index --check /dev/null docs/tasks/agentic-workflow-skills-2026.md`:
  PASS for this new, still-untracked record.
- Record read-back: all template sections present, proposal status retained and
  implementation acceptance items remain unchecked. This is a structural check,
  not a behavioral evaluation of skills.
- Generated-file SHA-256 matches the baseline; final status shows only the
  existing generated-file change plus this new planning record.
No product tests, runtime flows, remote CI or release operations were run.

### Implementation evidence, 2026-10-02

- Installed four new user-scoped skill directories and updated the shared planner
  with research-before-questions, implementation routing and explicit-only UI
  policy. Project-local skills and rules were left unchanged.
- Existing js-yaml parsing and assertions: PASS for five SKILL.md frontmatters,
  five UI metadata files, supported keys, descriptions, invocation names,
  portability and explicit-only planner policy; eight cross-skill references
  resolve both in staging and the installed directory.
- Bundled quick_validate.py: FAILED before validation because system Python lacks
  PyYAML (ModuleNotFoundError: No module named 'yaml'). No validator dependency
  was installed. The js-yaml checks above are the recorded alternative, not a
  claim that the bundled Python validator passed.
- Whitespace checks: all ten files pass direct trailing-whitespace/newline checks.
  Git no-index --check returned 1 for the new skill files with no diagnostics;
  that normal no-index difference status was not treated as a test failure/pass
  by itself. Direct whitespace validation establishes this result.
- Installed read-back: all ten files match the frozen self-reviewed SHA-256
  manifest. Skill directory placement and parseable metadata are verified;
  automatic selection by Codex or another editor was not tested.
- Preserved original shared planner at
  /private/tmp/shared-coding-skills.cvpZsI/original-shared-planner. Temporary
  fixtures and their detailed self-forward report are under the same staging
  root; the durable findings below do not depend on retaining those temp files.

Self-forward evaluation was performed by the implementing agent using isolated
synthetic fixtures, not an independent agent/model evaluation or a benchmark of
automatic skill activation. Executable checks establish fixture behavior;
policy/routing cases below are explicitly self-reviewed walkthroughs.

| Acceptance area/scenario | Actual evidence and limits |
| --- | --- |
| Portability and package manager selection | Synthetic npm and pnpm repository instructions/lockfiles select their own gates. Both ran successfully after repair; shared skills contain no hard-coded project paths or universal npm commands. |
| Approved resume | Reused approved fixture TASK.md and completed implementation, checks and self-review without requesting renewed approval. implement-task Start or resume encodes this behavior. |
| Unapproved ambiguity and researched input | Self-walkthrough wrote a proposed fractional-quantity policy contract, recommendation, consequence and next action; implementation source remained untouched. Planner Orient/Ask sections now require evidence first. |
| Debugging and failing gates | Both fixtures initially passed the allowed-input test but failed invalid-input rejection (1/2, exit 1). Missing validation was reproduced with negative/string input, repaired in the owned source and both gates passed 2/2. Tests cover zero/empty sums and negative/fractional/nonfinite/string rejection. |
| Existing user work | Both fixtures preserved notes.txt exactly, SHA-256 8f53813a3089bee460e16c330facd911d385e0bc857fcd18f2590243fab54ad2. Generated app file and local skill/website instruction hashes also match baseline. |
| Evidence freshness | Changed the already checked npm fixture source: fingerprint changed and gate failed. Restored the reviewed source and reran the gate successfully. verify-task records the conditions for reuse/invalidation. |
| Required runtime unavailable | Self-walkthrough leaves a required browser criterion unmet and recommends an authorized fixture/access or concrete manual check. No browser/device/backend evidence was claimed. verify-task states required deferral cannot silently become completion. |
| Review scope and fallback | Read fixture source, tests, task and untracked state; labelled self-review. review-task explicitly separates committed/staged/unstaged/untracked scope and requires rereview after material changes. No independent review was required by this implementation contract. |
| Standalone review and external scope | Self-walkthrough retains read-only review and excludes an unapproved push/external reply. Skills preserve existing authorization and do not grant release permission. No external action executed. |
| Guidance at each stage | All five skills explain the next useful action and require investigated uncertainty, recommended option and consequences when input is necessary. implement-task continues routine approved transitions and can work on independent items while awaiting a required answer. |

During fixture setup, a synthetic pnpm version pin caused pre-test stalls; runs
were interrupted, one attempted CLI flag was rejected, and installed CLI handling
was inspected. Removing only the synthetic version pin allowed the existing pnpm
runner to execute; manager choice remained in AGENTS.md and the lockfile. No
product manifest/configuration or project dependency was changed. This toolchain
issue was recorded rather than misreported as a passing test or product defect.

Reviewed and installed SKILL.md fingerprints:

| Skill | SHA-256 |
| --- | --- |
| grill-with-docs | 99ab1ec8a9a128bf1d677640886bf4aa09a91fecd1b33e1f639951a6040937e9 |
| implement-task | 7c49db398233eb2b6085c1926419e4a8cda57a4697a5ca9192739ed2292190ae |
| debug-task | cf0cf58eb90e77a5ce54febc720e7297edf42323ca378646845838eb767b94f0 |
| verify-task | 9033bd86edf8947f8738802d859ef5dfdb2f769dc782a0a313f8747133b4fa49 |
| review-task | 2de4d221b7383622d91e7b6c6dcfde3738e1cde1d29b8aef8a7b26a1d0429169 |

## Review

Self-review covered all ten installed files, approved scope, input guidance,
cross-skill routing and the recorded fixture outcomes. Installed bytes match
the reviewed manifest. No independent reviewer/model evaluation was invoked;
no measured improvement in real task performance is claimed.

## Handoff

All approved shared-skill acceptance items are satisfied with the checks and
explicit self-walkthrough limits above. The shared skills are installed under
/Users/francispham/.codex/skills and can be used on the next turn. Start with
$grill-with-docs; after approving its contract, use $implement-task to coordinate
the rest. Existing project workflow remains authoritative. Product/generated
work was preserved; no commit, push, deployment or external message occurred.
Optional runtime/CI/security tools remain later bounded tasks. Next useful step:
try the workflow on a real task and assess its observed decisions and handoff.
