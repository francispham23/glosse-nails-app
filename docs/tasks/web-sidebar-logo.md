# Task: Use logo.jpg in web navigation branding

## Contract

- Status: ready for review (browser verification deferred)
- Authorization: user requested `logo.jpg` for the web sidebar logo; approved the written plan with "go".
- Outcome: web sidebar and its tablet rail display the existing square logo artwork instead of the G monogram.
- Owned files: `components/workspace/navigation.tsx`, this task record.
- Out of scope: asset editing, landing page, native branding, compact bottom navigation, navigation behavior, dependencies, previous CI type-loading changes, commit/push/deployment.
- Stop after: local checks, web visual verification, self-review and handoff.
- Verification plan: focused workspace tests; `npm run verify:quality`; synthetic all-platform Expo export; local synthetic web component preview of sidebar/rail in light/dark themes; `git diff --check`. No production login or backend changes required for component preview.
- Baseline: preserve modified `tsconfig.json` and untracked `docs/tasks/ci-expo-web-types.md` from the preceding approved task.
- Assumptions / unresolved decisions: replace the monogram only on web in both sidebar and rail; retain sidebar's Glossé Nails / Staff workspace text. Use a bounded square image (44px, matching the original monogram frame) with contain sizing, accessible label and no artwork clipping. Native monogram and compact bottom tabs remain as implemented. No unresolved decision.

## Acceptance criteria

- [ ] Web sidebar and tablet rail show the entire `assets/logo.jpg` image with preserved square proportions, no clipping and an accessible Glossé Nails label.
- [ ] Branding remains visible in light/dark themes; sidebar text and all four navigation destinations remain usable.
- [x] Native monogram and compact bottom navigation remain unchanged; prior CI task changes are preserved.
- [ ] Applicable local checks, export, browser visual evidence and self-review are recorded with runtime limitations.

## Implementation notes

Inspected `components/workspace/navigation.tsx`, `hooks/use-workspace-layout.ts`, the existing landing image usage and the actual JPEG artwork. The shared navigation component uses compact mode below 600px, rail at 600–1023px and sidebar at 1024px+, with widths 96/224px. Gate the image replacement on web to preserve native branding. Reuse expo-image, which is already installed and used for this asset.

## Executable evidence

- Focused workspace tests passed: 6 tests, including navigation destinations, selection and prevented presses.
- `npm run verify:quality` passed: app/backend typechecks, zero-warning lint, 115 backend tests, 147 app tests and 2 export-script tests. Log: `/private/tmp/glosse-sidebar-quality.log`.
- Synthetic all-platform Expo export passed (exit 0): iOS, Android and web bundles generated in `/private/tmp/glosse-sidebar-export`; log `/private/tmp/glosse-sidebar-export.log`.
- `git diff --check` passed.
- Browser preview deferred: connected browser inventory was empty. A synthetic preview of the actual component was prepared in `/private/tmp/glosse-sidebar-preview` but not launched, since there was no browser to inspect it. No backend or production access occurred.
- Required light/dark sidebar/rail visual and accessibility verification remains open; square dimensions, contain sizing and the accessible label are implemented but are not browser proof.

## Review

Self-review of `components/workspace/navigation.tsx` (SHA-256 `a753321070eb4942ac1890d6349af81944f058f7db0fcbf564fa76a4c18d35a4`): web-only image branch, preserved native monogram, compact branch, sidebar copy and tab handlers. Superseded by the user correction below. No source findings. No delegation authorized.

## Handoff

Implemented the web image replacement. Local quality checks passed; browser acceptance remains deferred because no browser was connected. Native device and production behavior unverified. No commit/push/deployment. Prior CI type-loading work preserved.

## User correction: preserve original component layout

User clarified that the image must fit inside the previous component layout. Reused the original `styles.monogram` View (44x44, radius 14) and replaced only its web child with the image, sized to 100% of that bounded frame with contain fitting and matching radius. Branding spacing and native text remain unchanged. Previous 64px dimensions and source fingerprint are superseded. Browser visual verification remains deferred.

Correction evidence: `npm run verify:quality` passed (115 backend, 147 app, 2 export-script tests; typechecks and lint passed). Synthetic all-platform export passed to `/private/tmp/glosse-sidebar-correction-export`. `git diff --check` passed. Browser inventory remains empty. Self-review of corrected navigation SHA-256 `201359f2f66e73fe3698c146afbe8ec0703a9d1e1f24a72740960795aacd63f8` confirms the original frame is reused and only its web contents differ. No outstanding source findings; visual acceptance still pending.
