# Task: Stack-aware setup before coding in repositories without agent guidance

## Contract

- Status: complete
- Authorization: user explicitly invoked the shared grill-with-docs to add
  research, installation and use of stack-specific local skills, rules and a
  harness before product implementation in repositories lacking them. This turn
  authorized research and this contract. The user subsequently said "Approve
  and start implementation", authorizing the owned shared-skill changes below.
- Outcome: the shared workflow discovers missing agent guidance, researches the
  actual stack, adds a minimal compatible repository-local harness before
  product edits, and uses it through implementation, verification and review.
- Owned files after approval:
  - /Users/francispham/.codex/skills/grill-with-docs/SKILL.md
  - /Users/francispham/.codex/skills/implement-task/SKILL.md
  - /Users/francispham/.codex/skills/bootstrap-codebase/SKILL.md (new)
  - /Users/francispham/.codex/skills/bootstrap-codebase/agents/openai.yaml (new)
  - This task record; isolated disposable fixtures under /private/tmp.
- Out of scope for this installation: changing existing project-local skills or
  AGENTS.md, bulk setup across this computer, changes to product code or
  dependencies, copying the marketplace harness wholesale, global rules/config
  changes, automatic updates, commits, pushes, deployments or external messages.
- Stop after: install and locally validate the shared workflow addition, record
  actual fixture evidence and self-review, then hand off invocation guidance.
- Verification plan: validate metadata and cross-skill links; exercise isolated
  empty-guidance, existing-guidance, stack-mismatch and resume cases; validate
  installed read-back; run this repository's documentation checker and whitespace
  checks; preserve pre-existing work. No product suite for instruction-only edits.
- Baseline: branch update-expo-57, HEAD
  762b898a2546c241ab83d8cc8f0e529d563f158d. Existing modified generated file
  convex/_generated/api.d.ts and untracked
  docs/tasks/agentic-workflow-skills-2026.md must be preserved.
- Assumptions / unresolved decisions: no material product decision remains.
  Default to one small conditional setup skill, portable local instructions and
  selected stack skills, reusing existing tools. Additional tooling is included
  in a future task contract only when needed for that task's verification.

## Acceptance criteria

- [x] Detect stack, installed/resolved versions, package manager, repository or
  workspace boundaries, existing commands and test/runtime capabilities from
  manifests, lockfiles, configuration and affected code before recommending setup.
- [x] Inspect effective parent/nested agent instructions and existing skills,
  workflow docs and checks. A missing AGENTS.md or empty .agents/skills alone
  does not establish that the repository lacks usable guidance. Existing guidance
  is reused; fill only demonstrated gaps, preserving existing user files.
- [x] Research current primary stack documentation and relevant maintained skill
  sources before questions, recommendations or installation. Match guidance to
  installed versions and runtime; do not silently upgrade the app to fit a skill.
- [x] The planner records needed setup, exact proposed files, selected sources,
  compatibility reasoning and checks in the same product task contract. During
  planning, write only that record; bootstrap is research-only until authorized.
- [x] After approval, implement-task invokes bootstrap-codebase when needed and
  validates the resulting setup before product-code edits. Then explicitly load
  and apply relevant local skills/rules during implementation and review; do not
  assume files added mid-session have already been automatically loaded.
- [x] New repository guidance uses a concise AGENTS.md entry point, portable
  .agents/skills/<name>/SKILL.md skill folders with their required supporting
  files, and existing task/workflow formats. Add a small workflow/template only
  if absent and useful; avoid copying the global core workflow into every repo.
- [x] Select only necessary skills, inspect their instructions and actual tool
  requirements, retain licenses/attribution and record immutable source revision
  or release and installed file hashes in the existing task record. Preserve
  upstream support files and check all links; avoid conflicting name collisions
  and machine-specific symlinks in shared repository content.
- [x] Distinguish React web, Next.js and React Native/Expo; Next-specific APIs
  do not become Vite rules. The same stack-discovery and source-selection process
  works for non-JavaScript repositories and mixed-stack monorepos.
- [x] A harness includes real relevant checks, not only instructions. Discover
  and execute existing lint/type/test/build/runtime checks as applicable. Missing
  tooling is recorded and proposed with exact dependencies/configuration in the
  same future task plan when required; never describe absent checks as passing.
- [x] Normal approval covers setup and coding when both are in the contract;
  reuse approval already given. This user's standing request authorizes minimal
  reversible local guidance/skill setup for deficient repositories; record its
  concrete scope before acting. Do not impose another gate for routine setup.
  Material dependency, CI, hook or environment changes outside approved scope
  require a concrete contract revision before dependent mutations.
- [x] Unavailable sources, incompatible or absent upstream skills, unsupported
  tools and conflicting instructions are disclosed with a researched fallback.
  Where sufficient official documentation is available, concise original local
  guidance can substitute for an upstream skill. Required unavailable evidence
  prevents dependent completion; no speculative installation or unbounded retry.
- [x] Repeated runs reuse compatible local assets, check relevant version/source
  drift and do not reinstall, duplicate plans, overwrite user files or update all
  skills. Existing established repositories continue their current workflow.
- [x] Guidance remains conditional on using the shared flow; no claim that every
  editor/session is forced to invoke it or that installation proves better code.

## Research and design

### Shared workflow gap before this implementation

The shared planner already researches relevant primary documentation and stops
at task approval. implement-task preferred a repository implementation skill and
routed verification/review, but did not specify local setup when guidance
was absent. The installed routing now addresses this gap. The local Glossé workflow already supplies that context and will not
be modified. No specific empty repository was provided for installation now.

Added bootstrap-codebase as a conditional shared capability rather than giving
grill-with-docs permission to mutate repositories during planning. Its research
mode inventories the stack and drafts setup into the existing task; its approved
setup mode installs the selected assets, validates them and returns control to
implement-task. Preserve the planner's explicit-only invocation policy. The new
skill can use normal discovery with a precise missing-guidance trigger, and
must distinguish research authorization from mutation authorization.

Installed flow:

1. grill-with-docs: inspect repository and effective guidance; if deficient, use
   bootstrap-codebase to research the stack and propose exact local setup.
2. One task contract: setup files, product behavior, necessary checks and sources.
3. User approves: reuse existing approval or standing setup authorization where
   applicable; resolve only genuinely new material scope decisions.
4. implement-task: bootstrap missing guidance and required approved checks,
   validate and explicitly read it, then implement the requested behavior.
5. Existing debug-task, verify-task and review-task: use applicable local guidance
   and actual executable evidence, repair in scope, then hand off the same record.

### Reference harness inspected live

Inspected /Users/francispham/Work/Itshere/fe-delgate-marketplace:
.cursor/WORKFLOW.md, .cursor/hooks.json, selected React and unit-testing rules,
package.json and implement-ticket/SKILL.md. It uses React 19, Vite, TypeScript,
pnpm, Vitest/Testing Library, Playwright and task-specific skills. Useful patterns
include bounded contracts, selective guidance, scoped checks and runtime evidence.

Its Jira/Bitbucket paths, Figma gates, Cursor Plan/Build semantics, hooks, local
components, coverage conventions and installed libraries are specific to that
repository. They are evidence for adaptation, not applicable instructions for
other repositories. Its hooks configure edit-time autofixing and stop/shell
guards; their presence is not proof of enforcement in this Codex session. No
reference scripts, credentials, work artifacts or application-specific rules will
be copied into the shared workflow.

### Primary sources checked, 2026-10-02

- [OpenAI best practices](https://learn.chatgpt.com/guides/best-practices):
  concise accurate repository instructions, known build/test/lint commands and
  practical completion criteria. This supports a small factual entry point.
- [OpenAI AGENTS.md discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md):
  inspect effective global/root/nested instructions before inferring a gap.
- [OpenAI skill authoring and discovery](https://learn.chatgpt.com/docs/build-skills):
  portable repository skills under .agents/skills, progressive disclosure and
  explicit/implicit invocation. Duplicate names are not merged. Current online
  user-location documentation and the Skills CLI differ; preserve the currently
  verified ~/.codex/skills installation in this computer rather than migrate it.
- [Vercel upstream skills](https://github.com/vercel-labs/agent-skills) and
  [React performance skill source](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md):
  candidate React/Next guidance. Actual frontmatter names and resource paths must
  be inspected rather than inferred from a catalog label. Next-specific dynamic
  imports/server APIs and suggested fetching libraries do not apply universally.
  Upstream README and SKILL.md describe different rule counts; counts and search
  rankings are not selection criteria. This task installs no upstream bundle.
- [React rules](https://react.dev/reference/rules) and
  [React Hooks ESLint plugin](https://react.dev/reference/eslint-plugin-react-hooks):
  canonical behavioral rules and available executable lint support. Use installed
  compiler/plugin/version context; propose needed tooling in the task rather than
  silently changing dependencies or lint policy.
- [Expo's skill catalog](https://docs.expo.dev/skills/):
  select native-specific guidance when the repository is Expo, rather than assume
  React web recommendations establish native correctness.
- [Skills CLI upstream](https://github.com/vercel-labs/skills):
  selected project-scope installs and copying are supported. Verify available CLI
  syntax and immutable source resolution when installing; no all/global installs
  as part of local bootstrap. Direct retrieval of reviewed revision files is also
  acceptable when it preserves required resources and provenance.
- [Agent Skills specification](https://agentskills.io/specification):
  validate metadata and supporting resource layout; instructions alone do not
  supply installed tools, runtime environments or execution permissions.

Illustrative React setup after research: AGENTS.md routes to selected local
React guidance, actual repository commands and its normal task workflow.
Version-appropriate React rules and relevant Vercel resources inform changes;
existing lint/typecheck/behavior tests/build gates establish executable evidence.
Optional browser checks are determined by the acceptance journey. Retain existing
router, data-fetching and test choices unless a separately scoped change needs
to modify them. Do not add Zustand, SWR, Storybook, Tailwind or Playwright just
because the reference or a candidate skill uses them.

## Implementation notes

After approval, back up the two modified shared skill files outside repositories,
write concise original bootstrap instructions using skill-creator guidance,
validate staging before installation and verify installed read-back. Keep the
core routing short; source selection remains dynamic for the actual task's stack.
No product repository is bootstrapped during this shared-skill installation.

Fixture evaluation should cover:

- React/Vite without guidance: researched compatible setup before a scoped edit;
  actual available checks run; no Next.js-only instructions or library migration.
- Already configured repository: existing skills/rules/commands remain intact.
- Partial guidance or monorepo: effective inherited rules and correct local scope.
- Approved resume: setup uses authorization and the same task record without an
  unnecessary new gate; an unapproved task remains research-only.
- Non-React stack: no JS assumptions; appropriate official guidance/fallback.
- Unavailable upstream skill/source/tool: disclose the gap, use sufficient
  researched documentation where available, no fabricated verification.
- Rerun: no duplicate assets or replacement of user modifications; source drift
  is reassessed rather than silently updating everything.

Label manual policy walkthroughs separately from executable fixture checks.
No independent agent/model eval is authorized or claimed. Validate observable
artifacts and outcomes rather than test exact instruction wording.

## Executable evidence

Planning-only checks: node scripts/check-agent-docs.mjs passed for its 13 configured
files, 39 local links and 19 npm command references; this does not validate every
task record or external source. git diff --check passed for tracked changes.
Direct Node whitespace validation passed for this new task record. Git no-index
--check emitted no diagnostics and returned 1 because the record is a new file;
that difference status was not used as a validation result. At that planning snapshot, shared skills and
local skills had not been changed; their hashes and the existing generated-file
hash match the baseline below. Git status adds only this task record to the
pre-existing changes. No product tests or skill installations occurred.
Baseline hashes:

- Shared planner: 99ab1ec8a9a128bf1d677640886bf4aa09a91fecd1b33e1f639951a6040937e9
- Shared implement-task: 7c49db398233eb2b6085c1926419e4a8cda57a4697a5ca9192739ed2292190ae
- Local planner: 4a5bda234124f0064d4ec6a447dff9f1cd2046c88d5aa450a15704de48da4e51
- Existing generated file: eebf2df6c8d25e0f28321d6426f3a47536a779381e85912d26ae99ee5e24fefa

## Review

Planning self-review covered the proposed file ownership, approval boundaries,
conditional routing, effective existing guidance, source/version compatibility,
actual check availability, preservation and rerun behavior. Reference-marketplace
instructions remain evidence only. Implementation acceptance items were then unchecked; no independent review
or behavioral model evaluation was performed.

## Handoff

The approved shared workflow extension is installed and locally validated.
All acceptance items describe implemented instructions, checked artifacts or the
explicitly labelled policy walkthroughs below; they do not claim automatic skill
selection or independently measured behavioral improvement. Start a future task
with the shared grill-with-docs; its contract includes researched missing setup,
and implement-task runs authorized bootstrap before product edits. Existing
repository guidance remains authoritative. No product code, local skills,
application dependencies, global rules/configuration, commits, pushes,
deployments or external messages were changed by this installation. No required
work remains under this instruction-only contract. A real task is the next
opportunity to assess automatic selection and observed outcome quality.


## Implementation evidence, 2026-10-02

Installed original bootstrap-codebase/SKILL.md and agents/openai.yaml under
/Users/francispham/.codex/skills; added narrow routing sections to the shared
planner and implement-task. Existing UI metadata, planner explicit-only policy,
project-local skills and global rules were preserved. Original shared files,
staging, fixture scripts and reports are in /private/tmp/stack-bootstrap.o3apen.
The installed instructions are self-contained except for the existing shared
planner/execution companions, with relevant official-source discovery examples.

Validation performed:

- js-yaml/Node validation: three SKILL frontmatters and three UI metadata files
  parsed; matching names, descriptions, prompt names, policy, nine local links,
  portability and whitespace checked. All six installed files match the frozen
  self-reviewed SHA-256 manifest. Existing UI files were not rewritten.
- Bundled quick_validate.py could not run because Python lacks PyYAML
  (ModuleNotFoundError: No module named 'yaml'). No dependency was installed.
  Alternative js-yaml checks above passed; the Python validator did not pass.
- node scripts/check-agent-docs.mjs passed: 13 configured files, 39 local links,
  19 npm references. This checker does not certify all task records or remote
  links. git diff --check passed for tracked changes; direct whitespace validation
  covers this untracked record and the installed instruction files.
- Existing generated file and local planner hashes remain the baseline values.
  The existing unrelated task record remains unchanged, SHA-256
  79341eaf7979f402b582ba8af3d863c44d73ffa217818efe053918bc8b56d25f.

These are implementing-agent forward walkthroughs using isolated synthetic
artifacts plus executable checks, not independent model evaluations or tests of
automatic invocation. Fixture setup writers are evaluation helpers, not a new
production installer or an interpreter of the skill instructions.

| Scenario | Evidence and limits |
| --- | --- |
| Missing React/Vite guidance | Fixture used actual React 19.2.3 and Vite 8.3.0, npm, and temporary access to already installed dependencies. Original local guidance cited React rules; AGENTS.md, SKILL.md and its support reference were validated and explicitly read before fixing source. No Next API, router or library migration was introduced. npm test initially passed 1/2, exposing a zero-count conditional-rendering bug; after repair it passed 2/2. npm run build passed. These are server-render behavior and bundle evidence, not browser UX evidence. No lint tool was configured; no lint pass was claimed. |
| Non-JavaScript stack | Python fixture used Python 3.14.7, original local guidance and version-matched official unittest documentation. Standard-library tests initially passed 1/2, exposing repeated-whitespace handling; after repair, python3 -m unittest discover -s tests -v passed 2/2. No JS dependency/tool was introduced. |
| Research-only, unapproved task | Created only proposed TASK.md in a separate fixture. Executable artifact assertions confirmed no AGENTS.md/.agents installation and an unchanged product-source hash. Policy routing was manually followed, not automatically inferred by another model. |
| Existing usable guidance | Read existing rules; manually selected reuse, not setup. Executable hashes confirmed all original configured-repository files remained unchanged. |
| Inherited monorepo guidance | Read root AGENTS.md and its root mobile skill for the leaf mobile package. Root files retained their hashes; no redundant leaf AGENTS.md or .agents directory was created. No Expo/device checks were claimed. |
| Approved resume and rerun | Reused the approved task record and compatible assets, added a synthetic user note to the installed local fixture skill, then resumed without reinstalling. Hash assertions confirm the user-modified skill and unrelated notes.txt remain intact; no second plan or approval was introduced. This is a manual decision and executable preservation check. |
| Unsupported skill/source/tool or changed scope | Self-reviewed paths: reject Next-only recommendations for Vite; an upstream candidate needing unavailable tooling is not installed just to satisfy a label; sufficient official docs can support original local guidance. A required missing runtime/tool/source leaves evidence unmet, with recommended access/fallback or scoped contract revision. No real source outage, third-party skill install, dependency/CI change or runtime environment was exercised. Immutable upstream source, license and support-file requirements were reviewed in the instructions, not falsely claimed as an executed upstream installation. |

Additional fixture research checked React's official conditional-rendering page
(https://react.dev/learn/conditional-rendering) and Python 3.14 unittest guidance
(https://docs.python.org/3.14/library/unittest.html). Those sources support the
fixture diagnosis/checks, not a general claim that installing this skill improves
agent accuracy. Original fixture-local guidance was authored under the evaluation
contract, with hashes and sources in each fixture's existing TASK.md; no upstream
skill revision or license was fabricated.

Installed reviewed SKILL.md fingerprints:

| Skill | SHA-256 |
| --- | --- |
| grill-with-docs | 36ca3d38e72a87eaf255b4c6ce06b40e50d3db574efaf94d7d48c0cbdee39358 |
| implement-task | 75284a478a92d5252a8e4f7732230ece5749d4b5beb5903ed4dbc7459dd0f701 |
| bootstrap-codebase | 93860e5e175a8b45ff11af581b9b2f32469d99e59a04e878b5bc55bc7d390980 |

Implementation self-review inspected the two actual routing diffs, new skill,
UI metadata, fixture guidance/source/tests and final executable evidence. Scope,
planning-only boundary, approval reuse, conditional setup, effective inherited
instructions, source/version compatibility, minimal local setup, required-check
handling, teammate fallback and provenance were reviewed. No supported in-scope
finding remains in the reviewed state. No independent reviewer was authorized;
review is labelled self-review. Installation preflight checked the originals
against backups, and installed read-back matched the reviewed manifest.
