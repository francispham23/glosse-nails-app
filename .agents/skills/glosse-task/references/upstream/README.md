# Adapted-method provenance

Local references adapt selected methods; they do not install or invoke the upstream
workflow routers. Local task contracts and repository policies remain authoritative.
Reviewed/installed on 2026-10-02. Original source at the pins below is retained in
the research checkouts recorded in the task, not copied into always-loaded rules.

| Local reference | Source at reviewed revision | Retained method / local difference |
| --- | --- | --- |
| [design-and-impact](../design-and-impact.md) | [pstack blast-radius](https://github.com/cursor/plugins/blob/7022c81efb48d8b5eb15498ce6043a3bd74b694c/pstack/skills/blast-radius/SKILL.md) | Follow lifecycle/storage/library consumers and prove critical safety assumptions. Local scope gates proof edits; no required why/arena/unslop tool chain or risk numbers without evidence. |
| [design-and-impact](../design-and-impact.md) | [Matt codebase-design](https://github.com/mattpocock/skills/blob/d81f3a183412e71a5b1e84ca21bc1a35eea03a60/skills/engineering/codebase-design/SKILL.md) and [DEEPENING](https://github.com/mattpocock/skills/blob/d81f3a183412e71a5b1e84ca21bc1a35eea03a60/skills/engineering/codebase-design/DEEPENING.md) | Evaluate caller burden and actual variation. Preserve local vocabulary and tests; no blanket architecture rewrite, deletion or parallel design agents. |
| [testing](../testing.md) | [Matt tdd](https://github.com/mattpocock/skills/blob/d81f3a183412e71a5b1e84ca21bc1a35eea03a60/skills/engineering/tdd/SKILL.md), [tests](https://github.com/mattpocock/skills/blob/d81f3a183412e71a5b1e84ca21bc1a35eea03a60/skills/engineering/tdd/tests.md), [mocking](https://github.com/mattpocock/skills/blob/d81f3a183412e71a5b1e84ca21bc1a35eea03a60/skills/engineering/tdd/mocking.md) and [pstack tdd](https://github.com/cursor/plugins/blob/7022c81efb48d8b5eb15498ce6043a3bd74b694c/pstack/skills/tdd/SKILL.md) | Behavioral vertical red/green slices and independent results. Reuse approved scope without per-test approval; keep persisted-state checks and practical test selection. |
| [review](../review.md) | [Matt code-review](https://github.com/mattpocock/skills/blob/d81f3a183412e71a5b1e84ca21bc1a35eea03a60/skills/engineering/code-review/SKILL.md) | Distinct standards and contract lenses. Review actual staged/unstaged/untracked state too; no tracker prerequisite or automatic reviewers. |

MIT notices: [pstack / Lauren Tan](LICENSE-pstack) and
[Matt Pocock](LICENSE-matt-pocock), both 2026. Preserve these notices with adapted
material. Source versions are pinned; upstream updates require a new scoped review
and must not silently change this workflow.

Runtime-verifier generation and retrospective methods were researched but are not
implemented here. Their proposed follow-up scope and validation remain in
[the task record](../../../../../docs/tasks/emil-skills-installation.md).
