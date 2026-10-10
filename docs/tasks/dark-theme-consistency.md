# Task: Consistent semantic colors across themes

## Contract

- Status: complete
- Authorization: user invoked grill-with-docs to investigate all dark-theme components, especially forms. User approved the written contract with go and asked to continue.
- Outcome: consistent color roles across app UI on web, iOS and Android, prioritizing forms while retaining deliberate background/surface/elevation distinctions.
- Owned files: global.css; contexts/app-theme-context.tsx; utils/index.ts color mapping; components/Form/**; components/TransactionForm/**; components/Cards/**; components/Gift/**; components/Buttons/delete-button.tsx and theme-toggle-button.tsx; auth Landing/email routes; Settings; technician detail and report routes where audited color overrides exist; focused theme tests; this record. Navigation/workspace consumers only where mapping changes require an explicit corrected role.
- Out of scope: layout redesign, auth/backend/financial behavior, dependencies, unfinished email-reset functionality, asset recoloring, native OS-controlled picker redesign, commit/push/deployment.
- Baseline: preserve current staged and unstaged work. Current repository has prior Settings, Landing and password-control changes staged by the user; do not stage/unstage or overwrite them.
- Assumptions: retain current Glossé purple/teal and neutral palette. Existing page background, surface, surfaceVariant, foreground, muted, primary and error roles become the reference; different roles need not have identical colors. All-platform scope, light theme preserved and verified alongside dark theme.
- Verification: focused semantic mapping/theme regression tests where meaningful; isolated synthetic web screenshots and computed colors for auth/Settings/transaction/gift forms, cards/reports, dialogs/sheets and selected/disabled/error/focus states. Contrast checks against actual adjacent backgrounds (ordinary text 4.5:1, large text and essential controls 3:1; inactive controls identified separately). Actual user paths with synthetic fixtures and no production data. Native simulation plus iOS/Android smoke where an isolated build is available; label device gaps explicitly. Run verify:quality, all-platform synthetic export sequentially with Metro, docs checker and diff check.
- Stop after: scoped implementation, executable checks, self-review and evidence-backed handoff. No release actions.

## Source audit and cause inventory

1. global.css and app-theme-context define aligned foreground/primary/variant values, but CSS background is #15171f in dark while useThemeColor('background') maps to Paper surface #1e212c. Navigation/form backgrounds can consequently differ from CSS page backgrounds. Correct role mapping and inspect every consumer; don't flatten all surfaces.
2. FormHeader uses text-foreground then overrides dark headings with gray-300 and muted descriptions with gray-400. ErrorText and transaction validation text use red-500 instead of Paper error (#ffb4ab dark / #ba1a1a light).
3. Sign In Forgot Password text-button icons use accent-foreground/onPrimary (#261b68 in dark), meant to sit on primary fill, not on a neutral surface. Use the appropriate text-button content role. Contained-button onPrimary uses remain legitimate.
4. Settings, Landing, gift input helper labels, technician/card/report text override semantic muted/foreground with gray-300/400 or white. Remove inappropriate overrides by semantic role rather than replacing every text color indiscriminately.
5. Cards and report rows use bg-gray-300/dark:bg-gray-700; gift sheet uses literal #1f2937 and hardcoded handle/icon colors. New workspace components already use Paper surface/onSurface/outlineVariant. Older components need the same role vocabulary.
6. Paper themes spread MD3 defaults and override many roles, but retain default elevation/inverse/tertiary/disabled values. Audit roles actually consumed by inputs, chips, dialogs and sheets; define compatible neutral/elevation roles instead of blindly overwriting every MD3 color.
7. Selected transaction chips apply opacity-60, dimming all selected content; inspect actual selected/disabled rendering and contrast before deciding a scoped color correction. Selection meaning must remain distinguishable.
8. Numeric/password/date fields use Paper defaults and icon role props; no evidence yet that all input backgrounds themselves are wrong. Verify real rendered focus/placeholder/error/disabled states before adding per-field overrides.

Source scan covered app/, components/, hooks/, utils/ and root theme wiring. PaperProvider already receives paperTheme; this is not an absent-provider bug. Existing workspace colors are comparison/reference consumers, not automatically defective. Brand image backgrounds and modal backdrops are deliberate and excluded from blanket replacement. Source findings establish mixed styling; browser-visible severity/contrast remains to be measured.

## Primary guidance

- React Native Paper v5 theming: https://oss.callstack.com/react-native-paper/docs/guides/theming — semantic on-color pairings, neutral roles and elevation tints.
- Surface docs: https://oss.callstack.com/react-native-paper/docs/components/Surface — elevation changes surface color; retain meaningful visual hierarchy.
- Installed Paper TextInputOutlined reads theme background; local TextInputIcon accepts explicit icon color. Compare installed implementation rather than assuming latest major behavior.

## Acceptance criteria

- [x] CSS and Paper expose consistent semantic roles; background mapping and affected navigation callers use the intended page/surface role.
- [x] All audited form headings, descriptions, input text/placeholders/icons/outlines, errors and buttons use appropriate roles in dark/light themes without ad hoc gray/white/red substitutions.
- [x] Cards, report rows, gift sheets and dialogs align with the same surface/text vocabulary while preserving surface hierarchy.
- [x] Selected/disabled/focus/error states remain distinct and legible; actual contrast measurements recorded for representative roles and states.
- [x] Changing theme updates affected UI; layout, field values, password visibility, navigation and auth/financial behavior preserved.
- [x] Complete source inventory records each suspect as repaired, legitimate or explicitly deferred; no claim that every component was runtime-tested if only representative journeys were exercised.
- [x] Quality checks, exports, runtime coverage and native gaps recorded; final diff self-reviewed.

## Implementation notes

Prefer correcting theme roles and shared form primitives before consumer-specific changes. Do not replace tokens with a new palette or add a new theme dependency. Add missing semantic CSS roles only when actual consumers require them. Runtime-discovered new product behavior or unrelated defects remain out of scope.

## Executable evidence

- Corrected semantic background/surface/error mapping, added CSS surface/error roles, replaced audited gray/white/red overrides with semantic roles, aligned gift sheet/handle/close icon and destructive-button color pair, corrected Forgot Password icons, and defined palette-compatible Paper elevation colors.
- Removed selected-chip opacity reduction while retaining Paper selected/checkmark and disabled behavior. Selected technician border now uses primary in both themes. Report legacy title/bold rows explicitly retain foreground; found/repaired in self-review.
- Source scan found no remaining hardcoded gray/white/red utility colors or literal hex colors in app/components; theme definitions and deliberate backdrop/transparent values remain. No financial/auth/backend logic edited.
- Final verify:quality initially passed 115 backend tests and 143 app tests in 16 suites, plus typechecks and both lint surfaces. Additional outline/chip contrast expectations added; final gate passed again (115 backend / 143 app tests).
- Final Chrome runtime: Expo development web /private/tmp/glosse-theme-verified, disposable loopback backend 127.0.0.1:33210; synthetic Runtime 0 manager. No form submitted and no production data used. Signed in via ordinary synthetic Password auth.
- Screenshots: signin-dark, transaction-dark/light, chips-dark (selection/error/disabled Submit), settings-dialog-dark, settings-form-dark, gift-form-dark, gift-sheet-dark, reports-dark and income-dark. Preliminary final-equivalent auth colors/light form screenshots also at /private/tmp/glosse-theme-final. Dark Login/input text computed rgb(237,238,245). Input background is transparent over its intended themed container, not a defect requiring per-input override.
- Live theme switching tested on transaction form; controls and payment state remained present. Settings password form and visibility controls present; gift creation and Income report navigation work. Gift sheet visual review confirmed surface/variant/text and error/onError delete button.
- Contrast from configured role pairs, light/dark respectively: body/page 14.70/15.46; muted/variant 5.44/7.07; error/surface 6.46/9.45; filled-primary text 5.77/7.74; outline/page 3.82/5.68; chip text/secondary-container 6.20/7.70. Automated tests also assert text contrast over surface and elevation level3. These establish representative role contrast, not every rasterized pixel/state on every platform. Disabled controls remain separately governed by Paper disabled styles.
- Owned runtimes cleaned, synthetic credentials/scratch deleted and ports freed. Browser theme emulation reset and tab closed. One launch refused source drift during formatting, then cleaned; subsequent final snapshot used. Preliminary snapshots superseded for selected-border/report foreground repairs.
- Native device/runtime smoke explicitly unverified: no isolated native build exercised. Shared native source and native interaction suite plus all-platform exports provide local evidence only. Native OS pickers, unused inverse/tertiary defaults, brand imagery and intentional backdrop colors preserved.
- git diff --check passed; all-platform synthetic export passed at /private/tmp/glosse-theme-export.

## Review

Self-review of the complete unstaged task diff against the user-staged baseline: colors only, no source behavior/API changes; removed unused theme reads; preserved user-staged prior work. Found and corrected missing report-title/bold-row foreground and remaining amber selected-border override. Native picker behavior, form values, password state, selected/disabled logic and financial/auth callbacks untouched. No outstanding source findings. Working-tree fingerprints recorded below; delegation not authorized.

## Handoff

Implementation and representative runtime verification complete; final quality/export passed. Native runtime and exhaustive screen/state rendering explicitly unverified; no commit/push/deploy.

## Autofill follow-up

- User reported pale blue email/password fills on dark Login. This continues the approved form-color contract. Earlier typed-input checks missed autofill; their evidence did not establish autofill consistency.
- Browser cause: Chrome's autofill UA rules force light-blue background and fieldtext independently of ordinary Paper input styles. MDN documents the important UA declarations: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:autofill.
- Repaired only global.css: standard/WebKit autofill selectors use inset background paint, theme foreground text/caret and appearance none. Autocomplete, focus outline and input values remain enabled; native components are unchanged.
- Acceptance: autofilled email and password follow active light/dark roles, including theme switching. Verified Chrome's developer-forced autofill pseudo-state on both real Login inputs with synthetic text. This simulates autofill styling; saved-password insertion, Safari and Firefox remain unverified.
- Final runtime: /private/tmp/glosse-autofill-final, isolated Expo web and loopback backend. Dark computed paint/text #15171f/#edeef5; light #f7f8fc/#202331; both inputs match :autofill and appearance none. Screenshots dark.png/light.png retained. No login submission or production data. Browser pseudo-state/media overrides reset; tab closed and owned runtime cleaned.
- Final verify:quality passed both typechecks/lints, 115 backend tests and 143 app tests. Self-review: narrow web CSS change against staged baseline; forgiving selector handles standard/vendor alias, tokens track active theme, no transition delay or autocomplete suppression. Product export result recorded below.
- Final synthetic all-platform export passed at /private/tmp/glosse-autofill-export (iOS, Android, web). Docs checker and diff check passed. Reviewed global.css SHA256 d0a2a518fda41f33aef4bed7ed0f39bd85d5134f64d5939c5e2771f9e8e60a81 supersedes its earlier fingerprint. Only global.css and this record changed in the follow-up; staged user work preserved.

## Inset autofill refinement

- User requested a smaller, subtler autofill highlight and padding around its text, with a reference screenshot. Approved refinement stays web-only in global.css.
- Highlight now uses the surface role inside a 6px page-background inset, 8px corners and 12px horizontal text padding. Two inset shadows cover the forced UA fill without changing field geometry, icon positions or native components. Padding overrides RN's inline input padding only while autofilled.
- Chrome developer-forced autofill verified on actual Login email/password fields in both themes at /private/tmp/glosse-autofill-inset. Computed inset 6px, radius 8px, padding 12px; dark fill #1e212c on #15171f, light fill #ffffff on #f7f8fc. Screenshots dark.png/light.png retained; dark screenshot visually inspected. Removing forced state restores shadow none; edited email accepted normally. Saved-password insertion and other browsers remain unverified.
- Final quality gate passed: 115 backend tests, 143 app tests, both typechecks and lint surfaces. Self-review: scoped CSS refinement, theme tokens retained, outline rule unchanged, no autocomplete suppression. Browser overrides reset, tab closed and owned runtime cleaned. Final export/check results below.
- All-platform synthetic export passed at /private/tmp/glosse-autofill-inset-export. Docs checker and diff check passed. Final reviewed global.css SHA256 ad6f7ad586992da4ba9ca17514f59480f027b879c90c61a39560c230a873151e supersedes prior fingerprints. Light screenshot also visually inspected. Requirement evidence: inset paint is smaller than field, surface tint is subtle against page role, computed padding is 12px; all three verified in both themes. No native/runtime release claim; no stage/commit/push/deploy.

## Autofill border regression

- User reported that autofill still covered the outer field border. Previous visual acceptance missed this defect: inset shadows paint page-background color over Paper's separately drawn outline.
- global.css now clips autofilled input paint 6px from vertical edges with 8px corners. This exposes the complete Paper border without altering text padding, input geometry, theme tokens or native behavior.
- Final synthetic Chrome runtime /private/tmp/glosse-autofill-border: developer-forced autofill on both actual Login inputs. Computed clip inset(6px 0px round 8px), padding 12px. Visually inspected dark.png (password focused) and light.png (email focused): complete top/bottom/side outer borders visible, highlight inset, text readable. Show password successfully changed to Hide password. This remains simulated autofill styling, not saved-password insertion or other-browser proof.
- Quality passed: 115 backend and 143 app tests, typechecks/lints. Self-review confirms only scoped web CSS and this record changed; removed trailing whitespace. Browser overrides reset, tab closed, owned runtime cleaned. Final export and documentation results below.
- Final all-platform synthetic export passed at /private/tmp/glosse-autofill-border-export; docs checker and diff check passed. Reviewed global.css SHA256 0dd3eaef0a360c0ba3d8a868ab289ebe55f929b7fe54538548feafccaed507e0 supersedes earlier fingerprints. Borders explicitly verified this time; no native runtime or release claim, no staging/commit/push/deployment.

## Narrower autofill paint

- User requested less width. Changed only horizontal clipping from 0 to 8px per side (16px narrower). Vertical inset, text padding and field dimensions retained. Preserved the user's intervening change from surface fill to background fill.
- Synthetic Chrome autofill state on both Login inputs computed inset(6px 8px round 8px), padding 12px. Dark/light screenshots at /private/tmp/glosse-autofill-narrow; dark visually inspected for full outer border, narrower inner paint and readable text. Browser state reset and owned runtime cleaned. Saved-password insertion/other browsers remain unverified.
- Final quality passed (115 backend / 143 app tests, typechecks/lints). Self-review: one CSS value change, no native behavior or user color edits overwritten. Export result below.
- All-platform synthetic export passed at /private/tmp/glosse-autofill-narrow-export; documentation and diff checks passed. No staging, commit, push or deployment.

## Audit disposition

| Surface | Disposition |
| --- | --- |
| CSS/Paper roles and helper/navigation consumers | page background mapping repaired; semantic surface role retained; navigation consumes corrected role |
| Shared FormHeader/ErrorText, gift helper, auth/Settings/Landing text | semantic roles repaired; input/password/date/numeric primitives inherit Paper palette correctly |
| Sign In text-button icons | primary role repaired; contained reset-page onPrimary icon legitimate |
| Cards/report rows/technician detail | variant surfaces and semantic text repaired; selected border uses primary |
| Gift sheet/history | surface, variant, handle, close icon and text repaired |
| Delete/theme toggle buttons | error/onError and foreground roles repaired |
| Selected chips | opacity removed; checkmark remains selection indicator; disabled Paper styling retained |
| Workspace/calendar/modal components | existing semantic roles legitimate; intentional backdrop values preserved |
| Paper elevation | palette-aligned levels supplied; unused inverse/tertiary and standard disabled roles retained |
| Incomplete email-reset screens/native system controls/brand assets | shared FormHeader improvements apply; functionality/system styling/image recoloring excluded |

## Acceptance evidence mapping

Semantic-role tests and source audit establish role alignment; browser forms/sheet/report screenshots establish representative visual consistency; contrast test/ratios establish audited pair legibility; existing interaction suites and browser navigation/theme switch establish preservation. Source coverage is broader than runtime coverage. Native and exhaustive state gaps are explicit, as required by the availability-qualified contract.

## Reviewed product/test fingerprints

- app/(root)/(auth)/email/signin.tsx: 3e95575b74969e18f170ccfc6af838da7ad5b028dada8b45203a0ca5ece57372
- app/(root)/(auth)/index.tsx: ae21a4b06ec21522578ca31706e538ee71a2aa08d2bda7f8699ad4f0e9bb35aa
- app/(root)/(auth)/index.web.tsx: 05e2072b9cfa4cdc5c6e7692ceb0c9e13fb7d07a5c5bd969912903952095391a
- app/(root)/(main)/report/cash.tsx: c6c2812f8bf76e8a8f4c8eee7bf9be2a9a3a0dee8d7c4a45008c0175829fda46
- app/(root)/(main)/report/discount.tsx: ed9b2df863b407bbd0e8962b84fc6fa701ccc23bde5ef59253c9977550da0ac1
- app/(root)/(main)/report/gift.tsx: 86d74ce839a3988f6fd7e0b05bbb40195dd2bc4b0e8c25d7cb5a39d3ed6155b9
- app/(root)/(main)/report/income.tsx: f6f690eeea2344f35bdc13bad81700d6c3636a1d0cab02cdde95b4fbcbb22ae4
- app/(root)/(main)/report/payroll.tsx: 65d0d7fc84065527ff85e1baa93baa0a6b0af36ec9baad35506f3fd69929be7b
- app/(root)/(main)/report/supply.tsx: 857d28460d7b5cbb1893bafe2e68529558910121ce5ad495884ecfdf326f3e40
- app/(root)/(main)/settings.tsx: 7d866f415f2f916c3632e38bf8fa9bac424f836c8fa202f596906dfa51289424
- app/(root)/(main)/technician/[technicianId]/index.tsx: 184baf0db99fa17b38f295538d4647a2bf4f3b67986748c3402f6374301e2d3b
- components/Buttons/delete-button.tsx: efdec6ff2b93852dc9aa83a537ac2fc314515ae5a31db764c7044448034e6727
- components/Buttons/theme-toggle-button.tsx: 665be24212851ba9419995c79e0a1cc6b3b181bea8bc4b26680d408ccc18fafe
- components/Cards/gift-card.tsx: 2cf3bd68070963ca159db3b188f7eda89b6e87c6f159f77de0dbbc591af169c2
- components/Cards/report-card.tsx: 65ef0011a2743bdfc3acbeca68a80b572ce3590a78a5d8d43a4b6b648c111263
- components/Cards/technician-card.tsx: defa1aebb41e1c8fb76c781b8dfa8ba1f6c2e9ac30f8b0a47a88b89998189095
- components/Cards/transaction-card.tsx: e4b32de0525bb0bfb6f6a85d66dde11ee57e94a8a124be6f74915ee1d3d3ca86
- components/Form/form.tsx: 710721c5a2f5644c23d407413245c4c2ccff7e420aa4997bc31475891bbc3c6d
- components/Form/gift-card-inputs.tsx: 84f2163e0bd069ff44c94dde62babe044e21bc3a3e55d3ee31ce031c29005bd1
- components/Gift/bottom-modal.tsx: ab3f89550899071e2b977f388e1bcdff4843a6377884b32f583926edf23d13d0
- components/Gift/gift-card-transaction.tsx: 8b10686d5e37a458c1c627fa1cb868867446ab4fc7154f9f8712cacde7c406b4
- components/Gift/transaction-history.tsx: 2c23e6739833fd92c0f0b157a2f37a14a9f7fdb8ea10a57ce56b92ac27ec58f8
- components/TransactionForm/compensation-section.tsx: 878ebea680d33fd02f6be5394189e0e653a24fe78956edd5edad88ada6b9bb1c
- components/TransactionForm/form-chips.tsx: ddfb4162edbc44f775fff1849d99050a0bc2dfeb2622c708e9f85e7558979366
- contexts/app-theme-context.tsx: eb6cac7f0d646b37093aa6c3f9b305a796ce7a02966a699fc6515de5d63f905b
- global.css: e23dd56f788e86cfa62059ac79f7d95e8c175e2ff76c82af1c5b37b66d968318
- utils/index.ts: f4403d11631d9a416b873b7ea2e2ec4ab73e71cb3555caaa33be4df72eb7e098
- __tests__/theme-colors.test.tsx: 3a9ff55576d316b6d6a20864fb8fb319d35abdaa058df12d839fb5d31decf4c7

- Final documentation checker and git diff --check passed after record updates. Completed locally without committing, staging, pushing or deploying.
