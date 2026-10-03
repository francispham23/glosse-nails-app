# Task: Integrate researched skills into the Glossé agent workflow

## Contract

- Status: complete (phase 1: instruction installation/integration only)
- Authorization: User requested researched, stack-relevant installation from the three repositories and a composition plan, explicitly invoking `grill-with-docs`. After the expanded contract was presented, the user said **“Approve and start implementation”** on 2026-10-02. This authorizes phase 1's enumerated local installs and workflow adaptations. Runtime-verification implementation, pilots/retro and release actions remain separate proposals.
- Outcome: Add three researched, project-local specialist skills and focused impact/testing/review references to the existing workflow, with conditional routing, preserved approval boundaries and reproducible provenance. Keep `grill-with-docs` and `glosse-task` as the coordinators.
- Owned files:
  - `.agents/skills/animate-expo/SKILL.md`
  - `.agents/skills/animate-expo/RECIPES.md`
  - `.agents/skills/animate-expo/LICENSE` (upstream root licence)
  - `.agents/skills/animate-expo/UPSTREAM.md` (source/version and usage boundaries)
  - `.agents/skills/domain-modeling/{SKILL.md,GLOSSARY-FORMAT.md,ADR-FORMAT.md,agents/openai.yaml,LICENSE,UPSTREAM.md}`
  - `.agents/skills/writing-for-agents/{SKILL.md,SKILL-MECHANICS.md,agents/openai.yaml,LICENSE,UPSTREAM.md}`
  - `.agents/skills/grill-with-docs/SKILL.md` (conditional domain/document-writing pointers only; preserve the planning approval gate)
  - `.agents/skills/glosse-task/SKILL.md` (conditional specialist/reference pointers only; preserve one contract and one writer)
  - `.agents/skills/glosse-task/references/design-and-impact.md` (new adapted pstack impact method and Matt module-design lens)
  - `.agents/skills/glosse-task/references/testing.md` (new adapted behavioral testing guidance)
  - `.agents/skills/glosse-task/references/review.md` (add distinct standards/contract lenses and impact proof)
  - `.agents/skills/glosse-task/references/upstream/{README.md,LICENSE-pstack,LICENSE-matt-pocock}` (adaptation provenance and MIT notices)
  - `.gitignore` (allowlist only the three new skill directories)
  - `docs/tasks/emil-skills-installation.md`
- Out of scope: All other direct skill installs, whole plugins or alternate coordinators, global configuration/model settings, the adjacent Next.js website, product/UI/animation/backend changes, dependencies/lockfiles/generated files, native configuration, glossary/ADR content creation, runtime harness implementation or execution, issue-tracker setup, automation, external messaging, delegation, commits, pushes and deployments. Follow-up phases below are recommendations, not work authorized by this contract.
- Stop after: Install and validate the three selected skills, write the scoped adaptations/pointers, perform focused self-review, record evidence, and hand off uncommitted changes. Skill installation does not authorize running it on product code or starting the follow-up phases.
- Verification plan: Validate YAML metadata and local reference links across changed/new instruction files, byte equality for imported originals and licences, unique skill names/destination state, opt-in behavior for any future user-invoked skill, and Git visibility. Run `node scripts/check-agent-docs.mjs` and `git diff --check`; separately inspect unstaged/untracked files and source provenance. Use an available skill metadata validator; if Python PyYAML remains unavailable, use the existing Node `yaml` parser with the validator's allowed keys/name/description checks and record the fallback. Walk through the five routing scenarios below as a labeled instruction self-review, not a behavioral evaluation. App suites, exports and device tests are unnecessary for this instruction-only phase; any required product/runtime/configuration edit becomes separate scoped work.
- Baseline: Branch `update-expo-57`, HEAD `a38492dacc2555bea801240ce89b89bfd9f95653` (`fix workflow`). Working tree clean before planning. Canonical local workflow skills are `grill-with-docs` and `glosse-task`; specialized Expo/Convex skills are already available in the session. No existing task for this installation was found.
- Assumptions / unresolved decisions: Approved project-local, versionable `.agents/skills`, matching existing conventions. Preserve directly imported instructions verbatim and record host-specific boundaries in `UPSTREAM.md` and local coordinator pointers. Adapt useful methods into existing local references rather than import conflicting workflows. No unresolved product decision.

## Acceptance criteria

- [x] Research upstream bodies/supporting files before recommending additions. Evidence: all 14 Emil entrypoints read; all 50 pstack and 37 Matt entrypoint names/descriptions screened; shortlisted methods, relevant routers and supporting references read in depth at the pinned revisions. Detailed coverage and decisions below distinguish screening from full reads.
- [x] Ground the selection in current manifests and representative application code, rather than historical stack notes. Evidence: `package.json`, `app.json`, root layout, native cards, theme control, gift-card bottom sheet, numeric inputs and save feedback inspected.
- [x] Given approval, install only `animate-expo`, `domain-modeling`, and `writing-for-agents`, including the enumerated support files, available host metadata, MIT notices and provenance. Evidence: pinned helper installs succeeded; all 14 imported originals/licence files (including adaptation notices) equal pinned Git objects; provenance digests match.
- [x] Each installed skill's metadata validates, local references resolve, names are distinct and directories are visible to Git. Evidence: Node fallback validated five affected skill entrypoints, both supplied host metadata files, unique local names, 55 actual local Markdown links and all 25 owned files' visibility.
- [x] Preserve existing destinations and use only the reviewed upstream versions. Evidence: destinations were absent before install; pinned references supplied; pre-mutation checks rejected any imported-original mismatch/existing new support file; synthetic installer collision check refused an existing destination without changing its content. No actual upstream mismatch occurred; successful equality is verified against pinned Git objects, not a floating checkout.
- [x] Coordinators gained only scoped pointers/references and retain approval/ownership/test/evidence/release boundaries. Evidence: self-reviewed tracked diff plus all untracked owned files; exact 25-file scope check, unchanged HEAD and no staged files; documentation/whitespace checks passed. No product/dependency/generated file changed.
- [x] Adapted references retain meaningful red/green checks, independent expectations, persisted-state/auth checks and caller coverage without repeat test approval or automatic deletion/delegation/release. Evidence: `references/testing.md`, `design-and-impact.md`, updated `review.md` and self-review below.
- [x] Five routing scenarios passed instruction self-review. Evidence: walkthrough table below; no independent agent/behavioral evaluation claimed. Imported writing mechanics' host limitations are documented in its `UPSTREAM.md`.
- [x] Native/web boundaries, recipe limitations and reviewed revisions are documented. Evidence: all three `UPSTREAM.md` files plus adapted-method provenance; handoff distinguishes installation from device/runtime proof.

## Implementation notes

### Research source

- Repository: https://github.com/emilkowalski/skills
- Reviewed SHA: `e8a175de22ae1e49370fc144c1f3bb9aeedf988d` (research date: 2026-10-02, America/Vancouver).
- Downloaded read-only research checkout: `/private/tmp/emilkowalski-skills-research-20261002`.
- Read all 14 skill entrypoints, plus `animate-expo/RECIPES.md`, `break-ui/CATALOG.md`, `review-animations/STANDARDS.md`, `improve-animations/AUDIT.md` and `PLAN-TEMPLATE.md`, `prototype/PICKER.md`, `ask-sonner/API.md`, and root `LICENSE`.
- External skill text was evaluated as evidence, not executed as instructions. No upstream installer or skill-generated product change was run.

### Current stack and concrete relevance

`package.json` declares Expo `~57.0.24`, React Native `0.86.3`, React `19.2.3`, Expo Router `~57.0.22`, Reanimated `4.5.1`, Worklets `0.10.1`, Gesture Handler `~2.32.0`, Expo Haptics `~57.0.3`, React Native Paper, Gorhom Bottom Sheet v5, Uniwind and Convex. `app.json` enables React Compiler and static Metro web output. No authored Swift/Kotlin files were found outside dependencies/generated exclusions.

- `app/_layout.tsx` already wraps the UI in `GestureHandlerRootView`.
- `components/Cards/transaction-card.tsx` uses Reanimated `FadeIn`/`FadeOut` and Expo haptics. Other reports/cards also use those APIs.
- `components/Buttons/theme-toggle-button.tsx` uses Reanimated transitions and haptics.
- `components/Gift/bottom-modal.tsx` uses the established `@gorhom/bottom-sheet` component. An instructional recipe is not a reason to replace it.
- `components/Form/numeric-input.tsx` and `components/transaction-save-feedback.tsx` use React Native Paper rather than DOM inputs/Sonner.
- Installed package sources expose `scheduleOnRN`, shared-value `.get()` and `.set()`, spring `dampingRatio`, `useReducedMotion`, and Reanimated CSS transition types. This supports the selected skill's API family, without proving every recipe works on device or on web.

### Selection matrix

| Upstream skill | Decision | Substance and fit |
| --- | --- | --- |
| `animate-expo` | **Install** | Explicit native construction guidance for Reanimated 4/Worklets, Gesture Handler v2 (with v3 migration notes), Expo Router and haptics. Covers UI-thread motion, React Compiler-safe shared values, velocity handoff, restrained motion frequency, reduced motion, platform navigation and real-device validation. These libraries and UI surfaces exist here already. |
| `animation-vocabulary` | Optional, defer | A glossary for naming effects rather than building them. Many terms transfer to native UI, but it is not stack-specific and adds little implementation guidance beyond `animate-expo`. Worth adding later if the user wants help describing motion. |
| `break-ui` | Defer pending a native adaptation task | Plausible fixtures, empty/one/large lists, multilingual names and financial display extremes would be useful. Its actual harness/verification and fix signatures depend on URL toggles, browser zoom, DOM/CSS/RTL and HTML fallbacks. Do not present unchanged installation as a native testing workflow. |
| `find-animation-opportunities` | Defer | Useful read-only restraint/purpose/frequency filter, but recipes and sweeps target `:active`, `@starting-style`, clip paths, DOM conditionals and Motion spring configs. Native filtering is already covered by `animate-expo`; a native audit would need a separate bounded contract. |
| `improve-animations` | Defer | Adds an audit, its own `plans/` format, parallel subagents and executor dispatch. Reference checks are primarily CSS/Motion/WAAPI. Overlaps with this repo's task-record and approval workflow; would need native and workflow adaptation. |
| `review-animations` | Defer | Strict review rubric mostly assumes CSS, GPU/compositor rules, hover queries and Motion. It flags pure-fade entrances while `animate-expo` explicitly permits native layout animations and opacity feedback. Applying the unchanged rubric to the current `FadeIn` usage could produce inappropriate findings. |
| `emil-design-eng` | Defer | Broad taste and purposeful-motion principles transfer, but the long implementation/checklist body is dominated by CSS, DOM, browser DevTools, Base UI, Sonner and Motion. Native guidance in `animate-expo` is a more focused fit. |
| `animate` | Exclude for this app installation | Web construction skill using CSS transitions, `@starting-style`, WAAPI and Motion. Explicitly directs React Native work to `animate-expo`. Static Expo web output alone does not make DOM recipes suitable for shared native components. |
| `apple-design` | Exclude for this app installation | Despite the name, explicitly translates Apple design into web CSS, Pointer Events, Motion and browser materials/typography. Some advice (for example animating blur) conflicts with the native skill's Android limitations. No native-specific implementation benefit over `animate-expo`. |
| `mobile-native` | Exclude for this app installation | Explicitly a web/PWA skill: viewport meta tags, `dvh`, sticky hover, tap highlight, overscroll CSS, mobile input zoom and browser chrome. Could be reconsidered for a specific Expo-web/browser task, with web-only boundaries; it is not a React Native skill. |
| `write-swift` | Exclude | Swift value semantics, concurrency, actors, ARC, macros, performance and Swift Testing. This checkout has no authored Swift implementation to maintain. An iOS target does not itself require Swift-authoring guidance. |
| `pick-ui-library` | Exclude | Curated libraries primarily target the browser (Base UI, cmdk, Sonner, Motion, Virtuoso, next-themes, etc.). These are unsuitable defaults for the established Paper/Gorhom/Reanimated native stack; avoid dependency churn. |
| `prototype` | Exclude pending native adaptation | Variant exploration is useful in principle, but its mandatory verbatim picker has HTML markup, CSS, DOM measurements, keyboard events and URL state. Not an unchanged native Expo harness. |
| `ask-sonner` | Exclude | Sonner's browser React toaster/API/styling/portals. Sonner is absent; Paper dialogs and native feedback are already used. |

These decisions apply to `glosse-nail-app` only. The separate Next.js marketing repository may justify different selections, but it was not included in this task.

### Additional research sources and coverage

- pstack: `cursor/plugins`, subtree `pstack`, SHA `7022c81efb48d8b5eb15498ce6043a3bd74b694c`, plugin version `0.15.5`. Read-only checkout: `/private/tmp/cursor-plugins-research-20261002`. Inventory: 47 main skills plus three dormant Benny automation skills; 23 Poteto playbooks and two agent definitions. MIT, Lauren Tan, 2026.
- Matt: `mattpocock/skills`, SHA `d81f3a183412e71a5b1e84ca21bc1a35eea03a60`, plugin version `1.2.3`. Read-only checkout: `/private/tmp/mattpocock-skills-research-20261002`. Inventory: 37 entrypoints; 27 engineering/productivity skills in the plugin manifest, plus six in-progress and four misc skills. MIT, Matt Pocock, 2026. The user's URL has a trailing period; the actual repository is `mattpocock/skills`.
- Research date: 2026-10-02. Inspected actual cloned source and manifests, not just catalogue descriptions. Upstream commands were not executed. Source pointers should use the reviewed SHA, not floating `main`.
- pstack deep reads included `poteto-mode`, `setup-pstack`, `blast-radius`, `create-verification-skill`, `maintain-verification-skill`, `interrogate`, `architect`, `tdd`, `typescript-best-practices`, `how`, `why`, `swarm`, `reflect`, `figure-it-out`, `technical-writing`, `no-comments`, `automate-me`, `make-bot-ui`, the feature/bug/eval/shipping/opening-a-PR playbooks, both agents, plugin metadata, licence, Benny README, and all three verification feature-map examples. Arena, decision-trail, prose and principle material was inspected selectively; catalogue screening does not imply every supporting file was read end to end.
- Matt deep reads included `domain-modeling` and both formats, `writing-for-agents` and `SKILL-MECHANICS.md`, `retro`, `tdd` and tests/mocking references, `codebase-design` and DEEPENING/DESIGN-IT-TWICE, `ask-matt` and phase boundaries, `grill-with-docs`, `grilling`, `setup-matt-pocock-skills`, `to-spec`, `implement`, `implement-spec`, `code-review`, `diagnosing-bugs`, `improve-codebase-architecture`, `handoff`, `research`, `prototype`, `to-tickets`, and relevant wayfinder sections; bucket READMEs, plugin manifest, shortlisted `agents/openai.yaml` files and licence were also inspected. Remaining catalogue entries were screened for relevance, not declared fully reviewed.

### pstack selection and adaptations

| Method / group | Decision | Actual substance, fit and integration |
| --- | --- | --- |
| `blast-radius` | Adapt now into local `design-and-impact.md` | Trace library versions, lifecycle/teardown, data formats, storage and downstream consumers beyond symbol searches. Identify the critical safety assumptions and run the smallest executable proof. Useful for transaction/report consumers, async save feedback and native headers. Separate confirmed risks, cleared risks and unproven assumptions. Retain all required financial/access invariants rather than force safety into one fact. Drop mandatory `why`/`arena`/`unslop` tool chains and any automatic fan-out. |
| `create-verification-skill` | Adapt in a separate runtime follow-up | Strongest new capability: repo-grounded launch, read-only doctor, actual user drive, observable effects, owned-process cleanup and retained proof. Existing browser/financial harness is the starting point, not a new invented controller. Generate portable `.agents` guidance only after commands/driver/fixtures actually run. No claim that a generator solves native driver limitations. |
| `maintain-verification-skill` | Follow-up only after a working verifier | Keep recipes and entry-point maps current. Revalidate affected behavior after source/tool drift; schedule nothing automatically. Its full parallel source sweep, serial whole-map drive and automatic PR should not be imported unchanged. |
| `interrogate` / `arena` / `swarm` | Defer raw installation | Independent challenge and distinct architecture alternatives can help on a genuinely contested/high-risk design. Originals depend on Cursor `Task`, specific model families and agent/worktree behavior. Use existing read-only review with explicit delegation authorization; same-model reviewers must not be described as cross-model review. Competing implementations are costly and unnecessary for ordinary fixes. |
| `typescript-best-practices` and type/boundary principles | Selective ideas only | Boundary parsing, discriminated state and exhaustive variants fit TS/Convex. Preserve Convex `Id` types, generated validators and stored-record ownership; blanket trust in internal types does not establish authorization. Do not introduce brands/schema packages or rewrite types merely to conform. |
| `tdd`, root-cause/proof/idempotency principles | Already substantially covered; selective testing notes | pstack's TDD is deliberately narrow: cheap clear regression path, with a skip when expensive/unclear. This fits existing practical regression guidance better than imposing TDD on every instruction edit. Root-cause debugging and real-surface proof already exist locally; improve missing proof recipes rather than add duplicate entrypoints. |
| `poteto-mode`, `setup-pstack`, feature/PR/shipping playbooks | Exclude from this installation | Main mode is sticky and routes broadly through custom agents, model defaults and tool chains. Feature/bug playbooks delegate, commit and open PRs; PR playbook includes resetting/rebasing and ready PRs. Setup writes global Cursor model rules. Main mode also permits team chat/ticket actions without asking. Those are incompatible with this bounded, approval-based Codex workflow when imported unchanged. |
| `no-comments` and Comment Sicko | Exclude | Implements aggressive comment deletion, including ambiguous constraints, with a custom agent and architecture follow-ups. Public API/vendor exceptions exist, but default deletion is not appropriate for scoped workflow additions or preserving unexplained local constraints. |
| `how` / `why`, `show-me-your-work`, `figure-it-out` | Defer / use existing facilities | Useful runtime traces, epistemic distinctions and evidence trails, but automatic source-category searches, fan-out and a second decision-log/playbook structure duplicate the existing task record. Query available necessary sources; no assumption that Slack/analytics/trackers exist. |
| `reflect`, `automate-me`, `technical-writing`, `unslop`, `teach`, `recall`, `bro`, 23 leaf principles | No raw install in phase 1 | Writing/helpful principles overlap existing guidance; several route through extra agents/tools. Optional learning should yield a concrete recommendation/check after a real pilot, not another always-on rules layer or automatic global edits. |
| Benny and `make-bot-ui` | Exclude | Benny is dormant Slack triage/reproduction automation requiring channel/tracker/repo/control settings; bot UI requires webhook/Grok/Tailscale setup. No matching request, approved messaging or established infrastructure here. |

### Matt selection and adaptations

| Skill / group | Decision | Actual substance, fit and integration |
| --- | --- | --- |
| `domain-modeling` | Install now, invoke selectively | Resolve overloaded domain terms against code, use concrete edge cases, capture a glossary lazily and reserve ADRs for hard-to-reverse, surprising, genuine trade-offs. Relevant examples: gift-card balance versus technician history, transaction versus payment, active staff versus role. Existing financial/access policies remain authoritative; glossary points to policy rather than copies it. Creating domain documents requires inclusion in that future task's scope; this installation creates none. |
| `writing-for-agents` | Install now, use for instruction edits | Conditional context pointers, progressive disclosure, explicit completion criteria and a single source of truth fit the existing small AGENTS/local-reference structure. Use it while authoring these adaptations, without deleting existing rules based only on a theoretical no-op claim. `SKILL-MECHANICS.md` includes Claude-specific invocation mechanics; use Codex host metadata and repository rules for discovery/authorization. |
| `tdd` | Adapt behavioral method into `testing.md`; no raw install | Vertical red/green slices, real interfaces, boundary-only mocks and literal expected results are useful. Original requires the user to confirm test seams before any test and classifies database side-channel checks as coupled. Use test scope approved in the task contract without repeated approval; retain independent persisted-state/rollback/auth checks required by local policies. TDD is targeted to meaningful behavior and regressions, not every reversible documentation edit. |
| `codebase-design` | Adapt narrow design lens into `design-and-impact.md` | Small interfaces with substantial hidden complexity can reduce caller burden. Use only for actual recurring complexity, lifecycle or testability problems; do not force all app components into a new architecture. DEEPENING says to delete old shallow-module tests; preserve them unless separately approved and equivalent relevant coverage is proven. DESIGN-IT-TWICE's 3+ subagents require separate authorization. |
| `code-review` | Adapt standards/contract lenses into existing `review.md` | Separate documented-rule compliance from acceptance/scope compliance. Existing local review already includes financial/access checks. Review the actual committed AND staged/unstaged/untracked state requested, not just `<base>...HEAD`; record the reviewed snapshot. Existing repository standards override generic smells. Two lenses do not imply two reviewer agents ran. |
| `diagnosing-bugs` | Defer duplicate installation | Strong falsifiable hypothesis/red-signal loop, but shared `debug-task` already supplies reproduce → hypothesis → narrow repair → original scenario. Its demand for an unattended, fast reproducer needs care on currently unreachable native surfaces; report a gap rather than claim failure is solved by source changes. |
| `retro` | Optional after a pilot; port before install | User-invoked environment retrospective recommends navigation/checks/tool economy improvements and reads existing guardrails first. Good way to turn repeated mistakes into one deterministic check. Original has Claude `disable-model-invocation` and a `Skill` tool call; Codex port should use file reading and retain `agents/openai.yaml`'s `allow_implicit_invocation: false`. It suggests changes; it does not authorize them. No transcript mining outside the specified/current session and no memory writes. |
| `ask-matt`, upstream `grill-with-docs`, `grilling`, `grill-me`, `implement`, `implement-spec`, setup | Exclude competing workflow | Duplicate griller name would collide. Router supplies a second lifecycle and setup selects tracker/triage/domain conventions. `implement` explicitly commits current-branch work; `implement-spec` launches parallel branches, integrates and publishes draft PRs. Existing contract/approval/single-writer/release flow should remain the coordinator. |
| `to-spec`, `to-tickets`, `wayfinder`, `triage`, `handoff`, `research` | Defer | Large tracked work can use verifiable vertical slices/blocking edges, but the actual skills assume issue-tracker configuration and multiple records/tickets/handoffs. Current local task files already carry scope, dependencies and evidence. Reconsider only when several real tasks need a shared queue. |
| `prototype`, `improve-codebase-architecture` | Defer for a separate native/design task | Prototype branches include HTML logic demos or URL-based UI variants and automatic branch capture; architecture audit generates HTML reports. Useful for a specific design question, but not native implementation verification or routine workflow setup. |
| `pr`, `wizard`, teaching/questionnaire skills, misc/in-progress skills | No phase-1 install | Conditional communication/provisioning tools or unrelated training/beta work. Husky/lint-staged/CI already exist, so no second hook installer. Claude git hooks are host-specific; shoehorn migration adds a dependency. No evidence those solve this task's gap. |

### How the additions work together

The coordinator is the existing task lifecycle. Imported methods are consulted only for the branch that needs them:

1. **Plan — local `grill-with-docs`.** Inspect code/policies and write acceptance criteria. Read `domain-modeling` only when language/model decisions are unresolved. Include any proposed glossary/ADR file in scope before writing it. For shared/lifecycle/architecture changes, consult `design-and-impact.md` and turn critical assumptions into explicit checks.
2. **Approve — one existing contract gate.** The approved scope includes test interfaces and expected behavior where known; routine test choices do not add gates. Unresolved business rules still need a decision.
3. **Implement — local `glosse-task`.** Read relevant Expo/Convex guidance, the impact/testing references when triggered, and `animate-expo` only for native motion. Implement one observable slice at a time; get a meaningful red regression when practical, then green. No blanket refactor, test deletion, dependency installation or agent fan-out.
4. **Verify — existing checks and future real-surface verifier.** Use current scripts from `package.json`/workflow. Automated backend/app tests prove those behaviors; exports prove bundling. Runtime proof must state build/platform, backend target, synthetic fixture, exact action, expected/observed effects and gaps. A browser pass is not a native-header pass.
5. **Review — existing local review guidance.** Independently consider documented standards and acceptance/scope. Trace impacted consumers and prove critical assumptions, including mutation rollback and stored-record ownership. A separate reviewer runs only when available and authorized; otherwise label self-review. Repairs invalidate affected evidence/review until rerun.
6. **Handoff — same task record.** Mark each criterion with evidence or leave explicitly deferred. A later user-requested retro proposes one evidence-backed improvement; mechanical mistakes favor an existing linter/check/test over another paragraph of rules.

`writing-for-agents` supports instruction authoring across this sequence, rather than becoming a mandatory extra execution stage. Keep root `AGENTS.md` unchanged and route from the existing local skills. Do not create a second workflow map, global skill collection or duplicated business policy.

### Routing scenarios for phase-1 instruction self-review

- **Content/documentation task:** approved local contract → writing guidance if agent instructions change → docs/metadata checks → self-review/handoff. No TDD, architecture sweep, device check or extra approval.
- **Transaction rejection/retry bug:** contract + financial/access policies → lifecycle/consumer impact → real failing behavior with explicit expected values → narrow repair → app/backend checks plus required runtime surface → standards/acceptance review. Preserve failed drafts and verify persisted state.
- **Gift-card visibility/change:** distinguish shared balance from self-scoped history → stored-record ownership checks → direct function and consumer evidence. Glossary cannot redefine the access policy or replace it with types.
- **Native animation change:** local approval → `animate-expo` and installed stack → reduced-motion/platform branches → appropriate checks and actual native performance evidence, if required. Keep Paper/Gorhom unless replacement is approved.
- **Contested architecture/high-risk change:** impact/design lens → explicit ownership/checks → optional separately authorized independent review. No automatic swarm, worktree reset, model-rule write or commit/push/PR.

These are instruction walkthroughs, not simulated agents or independent evaluations. Behavioral benefit must be measured on actual future tasks.

### Rollout and benefit measurement

**Phase 1 — this proposed contract:** install three specialist skills and small local adaptations. Validate structure, provenance, routing and scope. Stop with uncommitted instruction changes. No new runtime helpers, glossary, ADR or retrospective skill yet.

**Phase 2 — separate proposed task: repeatable Expo runtime verification.** Start by inspecting/reusing `scripts/runtime-financial-check.mjs` and the existing disposable-backend setup. Produce a portable `verify-glosse` recipe with exact launch/doctor/drive/evidence/cleanup steps and a small feature map: transaction create/edit rejection and retry; gift-card balance/history/access; session/inactive-role behavior. Begin with one complete user path, capture UI action AND resulting stored effects, rerun it from a fresh fixture, and retain proof after cleanup. Confirm instance/build/target identity and clean only run-owned resources. Do not authorize a live backend, deployment or migrations as read-only setup. Investigate an actually supported native control path before writing native commands. Unexecuted native recipes remain drafts and native acceptance remains unverified; a browser-only recipe may complete a separately scoped web verifier, not native readiness. This phase needs its own owned files, environment authorization and acceptance criteria before implementation.

Concrete motivation: `docs/tasks/transaction-save-feedback.md` records the final native iOS bar/save smoke as unchecked (lines 269 onward); earlier browser/financial evidence predates the latest memoization repair (line 279). This is a known recorded gap, not a newly reproduced current failure. Installing skills cannot establish that it is fixed.

**Phase 3 — separately scoped pilot/learning:** try the composition on two real approved tasks (one financial/access regression and one native UI change). Compare with comparable completed task records: lead time, approval interruptions after contract approval, verification gaps, review rework/escaped regressions, and tool/token cost when available. Require acceptance evidence, no unauthorized scope/release actions and honest platform gaps. Two pilots provide directional observations, not causal proof. Keep additions that demonstrably help; prune redundant material. Port/install optional `retro` only if the user wants this explicit retrospective entrypoint. Prefer one deterministic check for a repeated mechanical error; no scheduled automation by default.

### Installation procedure after approval

1. Resume through `.agents/skills/glosse-task/SKILL.md`, verify Git and destination state, and keep this record as the sole contract.
2. Read `skill-installer`, then use its helper with `--repo emilkowalski/skills --path skills/animate-expo --ref e8a175de22ae1e49370fc144c1f3bb9aeedf988d --dest /Users/francispham/Production/GlosseNails/glosse-nail-app/.agents/skills`. For Matt use `--repo mattpocock/skills --path skills/engineering/domain-modeling skills/productivity/writing-for-agents --ref d81f3a183412e71a5b1e84ca21bc1a35eea03a60` and the same destination. Abort if any destination exists; preserve partial/previous state rather than overwrite it. Network/destination access may require normal sandbox review.
3. Include upstream MIT notices and `UPSTREAM.md` for each imported skill. Preserve all imported Markdown and supplied `agents/openai.yaml` files byte-for-byte. Record source path/SHA/date, source-file digests, usage triggers and host-specific boundaries. In particular, Matt's mechanics reference describes Claude invocation semantics; Codex discovery/permissions come from the host and local workflow. Domain documentation writes stay inside the approved task's owned files.
4. Apply the explicitly scoped local reference adaptations and conditional pointers. Record each source, method retained, local change and MIT notice under `glosse-task/references/upstream/`. Do not import unsupported raw frontmatter or invoke unavailable `Skill`/Cursor `Task` tools. Preserve current approval/release/test/ownership policies.
5. Allowlist only the three new directories and their contents in `.gitignore`; existing rules stay intact. No dependency or lockfile update.
6. Validate all changed skill metadata/references, check imported equality and provenance, confirm Git visibility, run documentation checks and all five routing walkthroughs, self-review actual changed/untracked files, and record evidence. Skill discovery on the next turn and actual agent behavior remain distinct from structural validation.

### Usage boundaries to preserve in provenance

- Existing repository contracts and approval rules still govern implementation. Installing a construction skill does not authorize UI, dependency or native configuration changes.
- Native Router options and gestures need platform checks; use web-compatible behavior when changing shared components. Do not apply native-only menu/sheet/header options universally.
- Keep established Paper and Gorhom components unless a future approved task specifically replaces them. Do not add keyboard-controller, Skia or Lottie simply because a recipe mentions them.
- Recipes are illustrative starting points: several omit the reduced-motion branch required by the main skill, use schematic identifiers and require integration with current types/component lifecycles. Do not copy them wholesale or call them validated application code.
- Honor the main skill's reduced-motion requirement in any future implementation. Release builds on supported physical hardware are required to establish motion performance/feel; source inspection, simulator work and skill validation cannot establish that.

## Executable evidence

Planning checks, not installation evidence:

- `git status --short` / `git status --porcelain=v1`: clean initial checkout.
- `git branch --show-current` / `git rev-parse HEAD`: `update-expo-57`, `a38492dacc2555bea801240ce89b89bfd9f95653`.
- Public repository clone into the temporary research directory: initial sandbox attempt failed DNS; approved network retry succeeded. Upstream `git rev-parse HEAD`: pinned SHA above.
- `node scripts/check-agent-docs.mjs`: passed (13 files, 39 local links, 19 npm command references).
- `git diff --check`: passed before the task record was created.
- Python `quick_validate.py` could not start with either system or bundled Python: `ModuleNotFoundError: No module named 'yaml'`; `python` alias is unavailable. No application dependency was changed to repair this tool limitation.
- Node fallback using the repo's installed `yaml` package: parsed upstream YAML, asserted exact skill name, valid hyphenated name/length, nonempty description/length, allowed frontmatter keys and absence of angle brackets, then resolved local references in both Markdown files. Passed: `animate-expo: YAML name/description/allowed fields and 1 local reference links passed (Node yaml fallback).`
- No skill installed in this turn; no application tests, bundles, device checks or production actions executed.
- After creating this record, `node scripts/check-agent-docs.mjs` and `git diff --check` passed again. `git status --short` showed only this new task record; destination-existence check confirmed `animate-expo` remains uninstalled. The Git whitespace check covers tracked diffs; the new record was separately checked for trailing whitespace/conflict markers.
- Expanded research: Node catalogue inventory parsed all pstack/Matt entrypoint YAML descriptions and counted 50 / 37 respectively. These counts include dormant/in-progress skills; they do not mean all are plugin-enabled or fully read.
- Expanded selection source check with the installed Node `yaml` parser: all three proposed skill names/descriptions/allowed fields passed; actual relative links passed (`animate-expo`: 1, `domain-modeling`: 2, `writing-for-agents`: 3); supplied Matt host metadata parsed; all three destination directories remain absent. This validates source structure, not installation/discovery.
- The first link scan falsely treated fenced glossary example links as required source files; source inspection confirmed they were illustrative. The corrected scan excludes fenced examples and passed. No source file was altered to satisfy the checker.
- Reviewed `SKILL.md` SHA-256 values: animate `9a01a91701e6563c67677dde6b66ab30f066a5341d42c21a90ba51d99679274a`; domain `7b925d7b1e341a2eeae33ad68a8a8c0ab889a38ddd22a7598e4c240e5a7556a3`; writing `551adca942227b44192edba88acd4e8db911f0121ce58ad16944ccf6a896a74a`.
- After expansion, docs checker passed again (13 files, 39 local links, 19 npm references); `git diff --check` passed; explicit untracked task whitespace/conflict-marker scan passed. Docs checker has fixed input coverage: it does not validate every link in this research record, so source-reference checking was separate.
- No skill installed, coordinator changed, retrospective run, runtime verifier generated, app check executed, delegation started or external action taken during this planning extension.

## Review

Historical planning self-review: selected one direct native match and two stack-independent additions that fit this repository's domain/instruction needs. Screened the two new repositories, deeply reviewed the selected methods and their workflow dependencies, and compared them with existing local/shared planning, implementation, debugging, verification and review skills. Scoped adaptations avoid duplicate coordinators and preserve the local financial/access/test/release boundaries. Walked through the five proposed routes for consistency; this was self-review of instructions, not independent agent or runtime evidence. Installation and completion checks were pending at that planning handoff; the approved implementation results follow.

### Phase-1 implementation and completion evidence

- Approval resumed on the same `update-expo-57` / `a38492dacc2555bea801240ce89b89bfd9f95653` baseline. Only the pre-existing untracked task record was present; no unrelated work needed alteration. All three research checkout pins rechecked.
- Built-in `skill-installer` helper installed Emil's `skills/animate-expo` at `e8a175de22ae1e49370fc144c1f3bb9aeedf988d`, then Matt's `skills/engineering/domain-modeling` and `skills/productivity/writing-for-agents` at `d81f3a183412e71a5b1e84ca21bc1a35eea03a60`, with the project-local destination. Both invocations exited 0. Normal sandbox escalation covered approved network/protected-directory writes; no automatic approval rejection occurred.
- Added only owned provenance/licences/references, conditional coordinator/review pointers and three Git allowlists. Imported Markdown/UI metadata remain unchanged. Existing root AGENTS/workflow/business policies/package scripts were not rewritten.
- `python3 .../skill-creator/scripts/quick_validate.py .agents/skills/glosse-task`: unavailable, exit 1 with `ModuleNotFoundError: No module named 'yaml'`. Used the approved Node `yaml` fallback; installed no Python or app dependency to repair the optional validator.
- `node /private/tmp/glosse-skills-validate-stage1-20261002.cjs`: passed. Compared 14 originals/licences against immutable `git show <pin>:<path>` objects; verified imported-file digest tables, five affected skill metadata mappings/names/descriptions/allowed keys/placeholders, supplied host YAML and local name uniqueness; checked 55 actual local Markdown references excluding fenced examples. All 25 owned files exist, are Git-visible and pass explicit whitespace/conflict checks. Exact changed-file scope matched; HEAD unchanged; no staging. This temporary checker is validation evidence, not a new repository tool.
- Synthetic installer collision check in a disposable `/private/tmp` directory: passed. Real helper `_copy_skill` raised `InstallError` for an existing destination and retained its original sentinel content/file list. No network or project mutation in that check.
- `node scripts/check-agent-docs.mjs`: passed, 13 fixed input files / 52 local links / 19 npm references. Supplementary link validation above covers changed/new files outside that checker's fixed input list.
- `git diff --check`: passed; explicit untracked-file whitespace/conflict checking above covers files the tracked diff excludes.
- Imported licence/entrypoint equality establishes installation integrity, not runtime behavior. No app suites, platform exports, live backend/device checks or actual pilot were run: only instructions/ignore rules changed, so the applicable completion gate is documentation/metadata/scope review.

### Implementation self-review and routing walkthrough

Reviewed all four tracked diffs and 21 untracked owned files, including source/support imports, provenance, notices and this record. No independent reviewer was spawned (delegation excluded by the approved contract). No remaining actionable finding in phase 1's scope.

Instruction/.gitignore reviewed fingerprint: SHA-256
`59bc878fb4690a125784a9bca753c25332a110b985054e35b0034bb2802d9f43`.
Computed from sorted owned paths plus each file's SHA-256, excluding this task record
to avoid a self-referential digest; the separately reviewed record carries the checks,
results and handoff. Final verification rechecks this fingerprint.

| Scenario | Actual route inspected | Instruction self-review result |
| --- | --- | --- |
| Documentation/content | Local contract; writing pointer only for agent instructions; existing docs gate | PASS: no architecture/TDD/device mandate or repeat approval for routine content. |
| Transaction rejection/retry | Lifecycle impact, behavioral regression and existing financial/access rules | PASS: independent expected results, stored rollback/draft checks and original repro retained; actual native/runtime evidence remains required where scoped. |
| Gift-card visibility | Terminology pointer when unresolved; stored ownership/direct function checks | PASS: glossary does not replace financial/access rules or create files outside approved scope; type safety does not imply authorization. |
| Native animation | Native motion pointer plus recipe/platform notes and relevant Expo guidance | PASS: reduced-motion/platform limitations exposed; established Paper/Gorhom and dependency scope preserved; no claim of physical-device proof. |
| Contested/high-risk design | Impact/design lens and local review, actual state/evidence | PASS: no automatic arena/swarm/models/reset/PR/release; review remains self-review unless independent delegation is available and authorized. |

These are manual instruction walkthroughs. Skill discovery is expected on the next
turn; no next-turn discovery or improvement in actual agent task outcomes has yet
been observed. Runtime-verifier and pilot/retro proposals remain outside phase 1.

## Handoff

Phase 1 is complete and locally validated. Three specialist skills are installed with their original support files/metadata, MIT licences and pinned provenance; the existing coordinators now route conditionally to them and the scoped impact/testing/review references. All 25 changed/new files are within the approved contract and remain uncommitted/unstaged. Imported skills should become available on the next turn.

The runtime-verification implementation and two-task pilot/optional retrospective remain proposed separate work. No native/browser/live-backend behavior or improvement in actual agent outcomes is established by this installation. Stop at this reviewed instruction handoff; no product changes, global settings, delegation, automation, external messages, commits, pushes or deployments were performed.
