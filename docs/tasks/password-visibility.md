# Task: Password visibility controls on all platforms

## Contract

- Status: complete
- Authorization: user invoked grill-with-docs for password-field buttons that show/hide passwords; all-platform plan approved by user with go.
- Outcome: functional independent visibility controls on web, iOS and Android password fields in active Sign In, Sign Up and Settings forms.
- Owned files: app/(root)/(auth)/email/signin.tsx; app/(root)/(auth)/email/signup.tsx; app/(root)/(main)/settings.tsx; focused interaction tests; this record. A small shared password field/control may be added if it avoids duplicated behavior without changing unrelated input props.
- Out of scope: unrelated layout changes, unfinished email reset routes, password validation/auth/backend changes, broad form redesign, Landing changes, dependencies, commit/push/deployment.
- Stop after: local/browser checks, self-review and handoff.
- Baseline: preserve all existing uncommitted Settings and Landing changes and tests.
- Assumptions: user explicitly clarified all platforms; apply consistently across active Sign In, Sign Up and Settings forms on web, iOS and Android.
- Verification: meaningful failing interaction regression, targeted tests, verify:quality, all-platform synthetic export sequentially with browser runtime, docs checker and diff check. Browser/device checks use synthetic text only; no credential submission/change needed to verify masking. Include native secureTextEntry interaction tests and iOS/Android device or simulator smoke where available; document unavailable native runtime evidence explicitly.

## Acceptance criteria

- [x] Fields initially masked on all platforms; click show reveals text and changes icon/accessible label; click hide masks again.
- [x] Each field toggles independently, preserving entered values and avoiding submit/navigation effects.
- [x] Keyboard activation works and labels identify field and next action, for example Show current password / Hide current password.
- [x] Settings supplies controls for current/new/confirmation fields; Sign In and both Sign Up fields use consistent controls.
- [x] Closing/reopening Settings password form resets visibility to masked, including after successful save.
- [x] Native and web fields share show/hide behavior; existing auth payloads, validation and unrelated layout unchanged.
- [x] Relevant tests, browser masking/keyboard proof, quality/export gates and self-review recorded.

## Investigation

- Sign In and Sign Up right-side eye icons lack onPress handlers and secureTextEntry is unconditional.
- Settings current/new/confirm fields use unconditional secureTextEntry and only decorative left lock icons.
- Installed React Native Paper TextInputIcon exposes onPress, forwards it from the button and supports focus control via forceTextInputFocus. Use the installed component rather than layering unrelated press targets.
- Unfinished reset-password route contains additional inert icons; excluded rather than expanding into unfinished auth flow work.

## Implementation notes

Keep visibility ephemeral and local to each field. Eye/eye-off controls on all platforms should expose next-action accessibility labels. Preserve field values and other input props when toggling secureTextEntry. Use synthetic input for tests; do not log password contents.

## Executable evidence

- Shared PasswordInput uses React Native Paper TextInput and a local visibility state, setting secureTextEntry and accessible eye/eye-off action. Used in Sign In, both Sign Up fields and all three Settings fields. Settings form unmount resets visibility after cancel/success.
- Initial source evidence: old icons had no onPress and fields unconditionally enabled secureTextEntry. No automated pre-fix red run recorded.
- npm run verify:quality passed: typechecks, backend/app lint, 115 backend tests, 141 app tests in 15 suites. Added actual Paper/native-input interaction test for masked/revealed/masked transitions, independence and value retention; Settings test verifies close/reopen reset. Auth boundary stubs do not prove live auth.
- Real Chrome/Expo development web at isolated localhost:33212 with disposable backend 127.0.0.1:33210. Synthetic text only, no password/account submission. Sign In input type password -> text (type attribute absent) -> password after mouse show and Enter hide. Accessible labels switched Show/Hide password. Sign Up confirmation reveal left primary password masked. Screenshot /private/tmp/glosse-password-proof/masked.png retained.
- Owned runtime cleanup completed, tab closed, ports free and synthetic scratch/credentials removed.
- iOS simulator inventory required escalation after sandbox service errors; iPhone 18 Pro/iOS 27 is booted. No isolated native app build established for this smoke, so native device runtime remains unverified. Android device runtime unverified. Native input behavior is covered by simulated interaction tests; iOS/Android/web synthetic exports passed (/private/tmp/glosse-password-export).
- git diff --check passed.

## Review

Self-review of shared component, three consumers and added interaction tests: local state independent per field, initial masking, native/web common input behavior, value/validation/auth payload preservation and Settings unmount reset. No outstanding findings; no delegation authorized.

## Handoff

Implementation and local/browser verification done; iOS/Android/web synthetic exports passed (/private/tmp/glosse-password-export). Native device checks explicitly deferred as permitted by availability-qualified contract; no native/device readiness claim. No commit/push/deploy.

Reviewed source SHA-256 fingerprints:
- PasswordInput: f8ca03357bd08414b33b5bdd0a67fb38ada2237ee358347ae2199e4ad3620c2e
- Sign In: fee90fe312bacd2736265cd35be12ac88d4b838fd02942e339c81d90ca7ee8d0
- Sign Up: 7ab1ecb5fc3ab44970ddc8de4ca43eee100554c5000bfc7a3823993f2fd8f132
- Settings: bc8996b3676c3b600778733c15d634d7ffe1a5af422a85c49123ac20434dd454

- Final docs checker and git diff --check passed. All required acceptance behavior covered by shared-input/Settings tests and browser evidence; optional native device smoke remains explicitly unverified.
