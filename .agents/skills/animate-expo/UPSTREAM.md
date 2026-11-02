# Upstream provenance: animate-expo

- Repository: https://github.com/emilkowalski/skills
- Source path: `skills/animate-expo`
- Reviewed revision: `e8a175de22ae1e49370fc144c1f3bb9aeedf988d`
- Imported on: 2026-10-02
- Original: https://github.com/emilkowalski/skills/tree/e8a175de22ae1e49370fc144c1f3bb9aeedf988d/skills/animate-expo
- Licence: upstream root MIT [LICENSE](LICENSE), copied unchanged.
- Original files below are byte-for-byte imports. This provenance file is local.

## Imported-file SHA-256

| File | SHA-256 |
| --- | --- |
| `SKILL.md` | `9a01a91701e6563c67677dde6b66ab30f066a5341d42c21a90ba51d99679274a` |
| `RECIPES.md` | `1193cb71334da2e2341778dd92bec9ac79d989cb07fd55d661f324ed5871e718` |
| `LICENSE` | `4ff5bdb7887ec1435c9cab0e8d1a7caee704d894d65c2a008ccc68b1cc2f260b` |

## Local usage

Use for an approved React Native motion change through the existing
[glosse-task workflow](../glosse-task/SKILL.md). Read this file alongside
[the upstream instructions](SKILL.md). This installation supplies guidance;
device behavior and animation performance have not been verified by installation.

- Retain existing Paper and Gorhom components unless replacement is in scope.
- Use current installed APIs and platform-compatible behavior for shared screens.
  Native navigation options do not automatically apply to Expo web.
- [Recipes](RECIPES.md) are illustrative: some omit the reduced-motion branch
  required by the main skill or use schematic identifiers. Integrate with actual
  types/lifecycles and include reduced motion; do not treat examples as tested code.
- Extra libraries mentioned in recipes require their own approved dependency scope.
- Source checks, tests and exports do not prove physical-device performance or feel.
  Record actual platform/build/runtime evidence when the task requires it.
