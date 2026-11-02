# Provenance: verify-glosse

Adapted workflow ideas from cursor/plugins pstack create-verification-skill and
its verification-skill/feature-map examples, reviewed at revision
7022c81efb48d8b5eb15498ce6043a3bd74b694c on 2026-10-02.

[Reviewed source](https://github.com/cursor/plugins/tree/7022c81efb48d8b5eb15498ce6043a3bd74b694c/pstack)
retains its [MIT notice](LICENSE-pstack). Local files implement concrete Codex CUA
browser actions, project-local .agents discovery and manifest-owned cleanup;
upstream Cursor tooling and native examples are not installed or certified.

The launcher pins the official Convex macOS-arm64 backend release
precompiled-2026-09-28-5c7cb5b. Archive SHA-256:
c1613bb4a3ac884871184020662c865a045cde95ad781fff002a6bd25f2f2890.
Binary SHA-256:
c6290f5a86bc2f6b31a931833c25106ccc06c0c8c9f0894c35f2d7cecf1fd676.
[Official release](https://github.com/get-convex/convex-backend/releases/tag/precompiled-2026-09-28-5c7cb5b).
The binary is temporary and removed with each run; existing npm dependencies are
reused. Platform/version changes require revalidation of the commands and proof.
