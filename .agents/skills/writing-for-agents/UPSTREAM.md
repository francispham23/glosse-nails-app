# Upstream provenance: writing-for-agents

- Repository: <https://github.com/mattpocock/skills>
- Source path: `skills/productivity/writing-for-agents`
- Reviewed revision: `d81f3a183412e71a5b1e84ca21bc1a35eea03a60`
- Imported on: 2026-10-02
- Original: <https://github.com/mattpocock/skills/tree/d81f3a183412e71a5b1e84ca21bc1a35eea03a60/skills/productivity/writing-for-agents>
- Licence: upstream root MIT [LICENSE](LICENSE), copied unchanged.
- Original files below are byte-for-byte imports. This provenance file is local.

## Imported-file SHA-256

| File | SHA-256 |
| --- | --- |
| `SKILL.md` | `551adca942227b44192edba88acd4e8db911f0121ce58ad16944ccf6a896a74a` |
| `SKILL-MECHANICS.md` | `c768e6307c7c10728c401c213f2c4ba71c542127eeb7ad2956aabd15a0fa0059` |
| `agents/openai.yaml` | `eacb24b2a618cfb81dacb0416f4fdd75ddf3a8060f8ddb99aae1b1e301907e4b` |
| `LICENSE` | `0e7ac423bf2c6e223b7c5b156f8cf72da49d748e56a1641402c31f22ad07dbb5` |

## Local usage and host mechanics

Use when writing skills or repository instructions. Read this file alongside
[the writing guidance](SKILL.md). Keep the local
[planning](../grill-with-docs/SKILL.md) and [implementation](../glosse-task/SKILL.md)
contracts in control of changes.

- [SKILL-MECHANICS.md](SKILL-MECHANICS.md) describes Claude-specific invocation
  mechanics. In Codex, name/description live in SKILL.md; supported invocation
  policy lives in agents/openai.yaml. Do not copy `disable-model-invocation` into
  Codex frontmatter or assume a Claude Skill tool exists. Read linked files using
  the available filesystem tools.
- Both imported Matt skills retain their supplied UI metadata and normal automatic
  discovery. Discovery does not authorize changes beyond the approved task.
- Improve conditional pointers and completion criteria within owned files.
  Preserve required approval/release rules and unique policy; pruning needs evidence
  of redundancy or a demonstrated failure, not merely a theoretical no-op label.
- Runtime commands and package versions come from current scripts/configuration;
  keep business policy in its existing source rather than another rule document.
