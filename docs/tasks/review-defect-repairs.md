# Task: Review defect repairs

## Contract

- Status: in progress
- Authorization: user invoked `grill-with-docs` on October 6, 2026 to fix the defects from the working-tree review. This record is planning only until the user approves it.
- Outcome: the reviewed web-modal, report-date, and calendar defects are repaired, with regression tests for each one.
- Owned files:
  - `components/screen-scroll-view.tsx`
  - `components/TransactionForm/index.tsx` (web error inset only)
  - `components/Form/form.tsx` (`FormContainer` top inset only)
  - `components/workspace/date-control.tsx`
  - `components/workspace/web-route-shell.web.tsx`
  - `components/Buttons/header-button.tsx`
  - `app/(root)/(main)/gift/create.tsx`
  - `components/workspace/calendar.web.tsx`
  - `utils/modal-route-dismiss.ts` only if the existing helper must accept the dismiss callback already used by the shell
  - Focused app tests and this record
- Out of scope: Android's pre-existing transparent-header overlap; the 90% dialog height; native picker replacement; report math, payroll rules, backend, schema, access, money payloads; new dependencies or upgrades; settings redesign beyond the shared `FormContainer` inset; rewriting `floating-controls.test.tsx` onto jsdom; commit, push, deploy.
- Stop after: approved implementation, targeted tests, `npm run verify:quality`, synthetic all-platform export, `git diff --check`, disposable web proof of the web repairs, self-review, and local handoff. iOS spinner proof is the component test unless a development build is already available.
- Verification plan: targeted app tests for padding, the iOS spinner, dismiss lock, and the year field; then `npm run verify:quality`, the synthetic all-platform Expo export, and `git diff --check`. After approval, disposable verify-glosse browser checks for the web repairs. No native build repair.
- Baseline: branch `add-more-skills`, HEAD `7bbab87c6c35e4c34e1c98cd705318b9481e9004`. Preserve the staged adaptive-workspace and web-modal work. Parent records remain [web modal routes](web-form-modals.md) and [adaptive workspace](adaptive-workspace-redesign.md).
- Assumptions / unresolved decisions: no product decision remains. Defaults below are the repair behavior.

## Acceptance criteria

- [x] On web, `ScreenScrollView` padding is 0 and `FormContainer` has no `pt-20`. A transaction save error uses 16px top padding on web. iOS scroll padding stays 64 in the test and `pt-20` remains. Live web measurement of the sign-in and gift forms was not completed.
- [x] Settings uses the same `FormContainer`, so the web class change applies there and the iOS class stays. No other settings code changed. Live settings was not opened.
- [x] The iOS spinner test keeps the picker mounted after `onValueChange` and records the date. The Android test removes the picker after confirm. The overview date route was not edited. No iOS device build was available; the component test is the contracted proof.
- [ ] Web modal routes use `role="dialog"` and a containing focus scope, and the backdrop is removed from the tab order. Tab containment, Escape, and backdrop dismissal were not exercised in a browser. The locked Close path is covered by the app test.
- [x] Gift-card create sets the dismiss lock before the request. The app test presses Close during the request and sees no dismiss, then unmounts and resolves the request with no `router.back()`. The create payload is still the existing code, value, and sell date. A mounted success return was not driven in the browser.
- [x] In the jsdom calendar, typing `2`, `20`, and `202` leaves February 2024 in place, blur restores `2024`, and one input of `2024` moves the focused month without changing the selected date.
- [x] Close with `canGoBack() === false` does not dismiss. A locked dismiss context does not dismiss. Existing transaction save tests still pass, including the locked header close.

## Implementation notes

Reviewed source is the staged tree at HEAD `7bbab87`. The published findings are the web overlay padding, the iOS spinner closing on the first `onValueChange`, the web route dialog not containing focus, gift-create navigating after it has unmounted, and the calendar year committing every keystroke.

Web modal headers are opaque because `useModalStackOptions` sets `headerTransparent` only off web. `ScreenScrollView` still applies `paddingTop: headerHeight` on web, and the transaction error banner adds `headerHeight + 16`. Auth forms use `FormContainer`'s fixed `pt-20`, which was the overlay clearance. An interrupted disposable session on October 6 measured the sign-in dialog at 1440×900: the panel was 880×810, and the Login title started about 102px below the header close control. That session ended before keyboard and submit checks. Doctor had passed for `/private/tmp/glosse-web-modals-20261006`; that run must be cleaned and not reused as proof.

`react-aria` 3.52.1 is already installed through `react-aria-components` and exports `FocusScope`. Use that for the dialog. Do not add another focus library. The sign-in anchor was inside `aria-hidden`, and the shell backdrop was a 1440×900 button with no dialog role. `aria-hidden` is not a substitute for containing Tab.

`tryDismissModalRoute` already skips locked and empty-history dismissal, and its tests call a `back` function. Header and shell currently call `router.dismiss()` directly. Pass the existing dismiss action through that guard so transaction locks and gift-create locks share one path.

iOS `DateControl` uses a spinner and closes inside `onValueChange`, which fires on every detent. Android `display="default"` opens a dialog and should still close on confirm. Native desktop Reports may keep applying each spinner change; that is the existing immediate desktop update, not a second bug.

The year input is controlled by `visibleRange.start.year` and calls `setFocusedDate` for every integer from 1 to 9999. Keep the typed text locally and move the calendar only for a complete in-range year.

Android screens still use a transparent header without `ScreenScrollView` inset. That overlap predates this review and stays out of scope.

## Executable evidence

- `npm run test:app -- __tests__/review-defect-repairs.test.tsx __tests__/web-calendar.test.tsx __tests__/transaction-save-feedback.test.tsx` passed 34 tests after the repairs.
- `npm run verify:quality` passed: app and Convex typechecks, backend lint, 115 backend tests, app lint with zero warnings, and 139 app tests.
- `git diff --check` passed.
- Synthetic all-platform export passed to `/private/tmp/glosse-review-repairs-export-20261006`.
- Doctor passed for `/private/tmp/glosse-review-repairs-20261006` before any browser actions. The browser step was skipped, so that runtime is not UI proof. iOS device smoke was not run.

## Review

Self-review of the repair diff. Web overlay padding is limited to iOS. The iOS spinner no longer closes on each detent; Android still closes on confirm. Gift create locks dismissal for the request and skips `router.back()` after unmount. The year field commits only a four-digit year. The dialog uses the installed `react-aria` `FocusScope`. No independent review was run. Browser confirmation of focus containment and the visual header gap is still open.

## Handoff

The five reviewed defects are implemented and covered by app tests, the quality gate, and an export. Live web confirmation of the dialog focus trap and the header gap was not completed. Next step is a disposable browser pass of sign-in, gift create, and the reports year field. No commit or deploy.
