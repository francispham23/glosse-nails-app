# Upstream provenance: domain-modeling

- Repository: <https://github.com/mattpocock/skills>
- Source path: `skills/engineering/domain-modeling`
- Reviewed revision: `d81f3a183412e71a5b1e84ca21bc1a35eea03a60`
- Imported on: 2026-10-02
- Original: <https://github.com/mattpocock/skills/tree/d81f3a183412e71a5b1e84ca21bc1a35eea03a60/skills/engineering/domain-modeling>
- Licence: upstream root MIT [LICENSE](LICENSE), copied unchanged.
- Original files below are byte-for-byte imports. This provenance file is local.

## Imported-file SHA-256

| File | SHA-256 |
| --- | --- |
| `SKILL.md` | `7b925d7b1e341a2eeae33ad68a8a8c0ab889a38ddd22a7598e4c240e5a7556a3` |
| `GLOSSARY-FORMAT.md` | `21dcc40cdec8e151a829b98ab1517c1867bc444e3665134a98c6983411996801` |
| `ADR-FORMAT.md` | `944c92aa790e8fbdc9199640b170979abb8a34ba8d0fe18c2a01a63bce140ca0` |
| `agents/openai.yaml` | `f6bf2aa996c6e6f53fdd0708e18a0d16a56aed8322cca59fedbe3c0d2c75f06b` |
| `LICENSE` | `0e7ac423bf2c6e223b7c5b156f8cf72da49d748e56a1641402c31f22ad07dbb5` |

## Local usage

Use when an approved task needs precise business terminology, glossary work or a
consequential domain decision. Read this file alongside [the instructions](SKILL.md).
The local [griller](../grill-with-docs/SKILL.md) and
[executor](../glosse-task/SKILL.md) retain control of scope and approval.

- During planning, capture terminology and decisions in the existing task record.
  Include proposed glossary/ADR files in its owned scope before implementation;
  importing the skill does not authorize its inline documentation writes.
- Create glossary/ADR files lazily when an approved task has content to record.
  Keep a glossary about terminology. Link to existing financial/access policies
  for rules instead of copying them or treating the glossary as a competing spec.
- Where user intent, policy and code disagree, expose the concrete conflict and
  resolve the business decision; do not silently redefine terms to match a bug.
- This install creates no glossary or ADR and changes no financial/access rule.
