# Task: Web modal routes

## Contract

- Status: in progress
- Authorization: user approved the attached web modal routes plan on October 6, 2026
- Outcome: on web, every existing modal route opens as a dialog over the previous screen; gift sell date and service time are editable on web
- Owned files:
  - [app/(root)/(main)/_layout.tsx](../app/(root)/(main)/_layout.tsx), [app/(root)/(auth)/_layout.tsx](../app/(root)/(auth)/_layout.tsx)
  - [app/(root)/(main)/technician/_layout.tsx](../app/(root)/(main)/technician/_layout.tsx), [transaction/_layout.tsx](../app/(root)/(main)/transaction/_layout.tsx), [gift/_layout.tsx](../app/(root)/(main)/gift/_layout.tsx), [report/_layout.tsx](../app/(root)/(main)/report/_layout.tsx), [email/_layout.tsx](../app/(root)/(auth)/email/_layout.tsx)
  - New workspace shell/dismiss helpers and web picker adapters under [components/workspace/](../components/workspace/) and [components/Form/](../components/Form/) / [components/TransactionForm/](../components/TransactionForm/)
  - Focused app tests and this record
- Out of scope: native presentation, overview date/range sheets, settings, Alert.alert replacement, backend/money/access, dependencies, commit/push/deploy
- Stop after: local implementation, executable checks, browser evidence, self-review, handoff
- Verification plan: targeted app tests, `npm run verify:quality`, synthetic all-platform export, `node scripts/check-agent-docs.mjs`, `git diff --check`, disposable browser checks
- Baseline: branch `add-more-skills`; preserve uncommitted adaptive workspace work
- Assumptions: Expo Router `~57.0.24` renders `modal` as a regular web route; `transparentModal` keeps the anchor visible per Expo web modals guidance

## Acceptance criteria

- [ ] Modal routes from Earnings, Transactions, Gift Cards, Reports, and auth landing open over the current page on web; background unchanged until save
- [ ] Narrow bottom sheet / wide centered dialog; resize keeps draft; themes readable; no horizontal overflow
- [ ] Close, Escape, backdrop dismiss without submit; locked transaction save blocks dismiss; save/delete/nested edit navigation unchanged
- [ ] Direct modal URL shows anchored background behind dialog
- [ ] Gift sell date changes calendar day only; service time changes clock on same day; bounds preserved; native pickers unchanged
- [ ] Email sign-up/password and report details remain inside dialog with unchanged figures/permissions

## Implementation notes

Record decisions during implementation.

## Executable evidence

Record commands and results at handoff.

## Review

Self-review unless separate reviewer authorized.

## Handoff

Changed behavior, risks, next step.
