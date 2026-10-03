---
name: verify-glosse
description: Verify an approved Glossé browser/backend task in a disposable local runtime with identity checks, real UI actions, stored-effect proof and owned cleanup.
---

# Verify Glossé

Use after an approved task requires browser/backend evidence. Read the task's
acceptance criteria and [feature map](features/README.md); select the matching
recipe. This verifier deploys to a disposable loopback backend and mutates
synthetic fixtures. Its execution requires that scope in the approved contract.
Reuse existing approval; unresolved shared/native/release scope needs a separate
contract. Use [glosse-task](../glosse-task/SKILL.md) for implementation and handoff.

## Launch and identify

Run from the repository root on macOS arm64, with its existing node_modules and
a browser controller available. Choose a new evidence directory under an existing
parent. Commands below were executed with two fresh databases:

```sh
node scripts/runtime-verification.mjs launch /private/tmp/glosse-runtime-proof-run1
node scripts/runtime-verification.mjs doctor /private/tmp/glosse-runtime-proof-run1/manifest.json
```

Launch copies current tracked/unignored application sources into private scratch,
excludes normal env files, uses existing dependencies, verifies the official pinned
Convex archive/binary hashes, deploys only to API 127.0.0.1:33210, seeds four synthetic
actors and a shift, runs the financial API harness, and starts Expo web on
localhost:33212. Site proxy is 127.0.0.1:33211. Ports on IPv4 and IPv6 must be free;
existing destinations are refused. The generated manifest identifies source,
process start/command fingerprints, backend pin and run-owned scratch.

Doctor reads health/auth/source/fixture identity without signing in or writing
financial state. Refuse driving when it fails. Browser launch URL and private
credentials path come from launch output. Read private actor credentials directly
into the browser controller; print neither credentials nor filled login snapshots.
Use normal Password sign-in only against this identified disposable app. Main
checkout config, generated files and product validators remain unchanged.

## Drive and prove

For transaction save, read [the executed recipe](features/transaction-save.md).
Use the available CUA browser controller; helper commands provide fixtures and
stored comparisons, not UI automation. Observe controls before acting and save
redacted screenshots/accessibility snapshots in the evidence directory. Confirm
the success dialog and its submission lock before acknowledging it.

For API-only gift/access coverage, consult [gift card](features/gift-card-access.md)
or [session](features/session-access.md). API success cannot satisfy a browser or
native acceptance criterion. This skill contains no verified native recipe.

Retain action/result evidence plus source/run/target identity, full rollback
comparison results and explicit expected stored values. Raw backend logs, tokens,
passwords and ephemeral keys stay in private scratch; they are deleted at teardown.
Required unexecuted acceptance prevents marking the task complete.

## Clean up and hand off

Close only the test tab, then run:

```sh
node scripts/runtime-verification.mjs cleanup /private/tmp/glosse-runtime-proof-run1/manifest.json
```

Cleanup checks process identities before terminating their owned process groups,
checks free IPv4/IPv6 ports, removes owned scratch/credentials/data, and retains
proof with cleanup.json. Launch failures attempt the same teardown. For an
interruption, inspect the manifest and use this command; stale identity refuses
cleanup. Preserve the manifest and diagnose ownership instead of killing by name
or port. A closed manifest makes cleanup idempotent.

Record actual evidence and self/independent review in the task. Distinguish Expo
web development runtime, authenticated local backend checks, simulated unit tests
and unverified native/OAuth/release behavior. See [provenance](UPSTREAM.md).
