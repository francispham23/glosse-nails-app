# Task: Repair Landing logo

## Contract

- Status: complete
- Authorization: user invoked debug-task to fix Landing logo and search best practices; written plan approved by user with "go".
- Outcome: existing Glossé logo renders visibly, proportionally and at a bounded responsive size on Landing.
- Owned files: app/(root)/(auth)/index.tsx; focused regression only if meaningful; this record.
- Out of scope: logo redesign or asset editing, shared Container refactor, auth behavior, dependencies, Settings changes, commit/push/deployment.
- Stop after: executable checks, browser proof and self-review handoff.
- Baseline: implement-web-app at 7f24cd5; preserve existing uncommitted Settings repair and its tests/task record.
- Assumptions: preserve current logo.jpg artwork and existing landing copy/sign-in controls. Diagnose actual rendering before choosing dimensions.
- Verification: isolated Expo web with synthetic configuration; inspect current image load/natural dimensions/rendered bounding box; then desktop and narrow-screen visual checks in light/dark themes. Run verify:quality, all-platform synthetic export, docs checker and diff check. Run export and Metro sequentially to avoid shared cache contention.

## Acceptance criteria

- [x] Record actual baseline rendering and supported cause; valid asset alone is not runtime proof.
- [x] Entire logo visible without distortion or clipping at narrow and desktop widths, with bounded dimensions and usable sign-in controls.
- [x] Logo remains legible in light and dark themes and has accessible label Glossé Nails.
- [x] Existing sign-in destinations/copy preserved; prior Settings work preserved.
- [x] Required checks, browser evidence and scoped self-review recorded; native device limits explicit.

## Implementation notes

Leading hypothesis: percentage-height image in an aspect-ratio wrapper inside scroll/flex layout has unreliable sizing. Current square 770x770 JPEG is valid, but displayed in aspect-video wrapper with mb-40. Confirm actual browser dimensions before the narrow fix. Prefer explicit image style with bounded width/height or a reliably resolved matching aspect ratio; retain contain and replace Landing background label with Glossé Nails. Adjust only logo-related spacing if baseline proves necessary. Existing transparent alternatives inspected; no asset replacement planned.

## Research and evidence

- Expo SDK 57 Image docs match installed ~57.0.5: https://docs.expo.dev/versions/v57.0.0/sdk/image/ . contain preserves source proportions; accessibilityLabel sets web alt. Installed Image.types.ts confirms both contracts.
- React Native sizing docs: https://reactnative.dev/docs/height-and-width . Percentage dimensions require a parent with defined size.
- Inspected Landing, Container, auth layout, theme context and three existing logo assets. Runtime cause remains unconfirmed at planning handoff.

## Review

Self-review of Landing diff against 7f24cd5: no auth, asset, shared Container or Settings edits. Reviewed responsive sizing, retained contain behavior, label and route preservation. SHA-256 fe34fd6e93f9fcebed8fadf5aa1f33ecd96883c1ebe566dda8b1f68d85bf02ba. No outstanding findings; no delegation authorized.

## Handoff

Implemented and browser-verified; final export passed. Native device and production behavior unverified. No commit/push/deployment.

## Executable evidence

- Baseline disposable Expo web runtime: loaded JPEG natural dimensions 770x770; image measured 1872x1053 while immediate expo-image wrapper measured 1872x0. Accessibility tree omitted logo. This supports collapsed wrapper/percentage-height sizing as the cause, not a missing asset.
- Repair: remove percentage-height image and aspect-video wrapper, set image width/height to min(320, window width minus 48), center image, use 32-point bottom spacing, retain JPEG and contain, remove initial fade and label image Glossé Nails.
- Actual browser regression used instead of a unit test that would only mirror styles: Chrome, disposable Expo development web and loopback backend 127.0.0.1:33210, no login required. Final proof at /private/tmp/glosse-landing-final; baseline at /private/tmp/glosse-landing-proof.
- Desktop 1920x873: visible loaded 320x320 logo in both themes. 375x812: visible 320x320 logo in both themes. 320x568 light: 272x272 logo at x24/y88, entirely visible along with sign-in controls. Screenshots desktop-dark.png, desktop-light.png, mobile-dark.png, mobile-light.png, small-light.png retained.
- Actual Email click opened /email/signin and showed login fields. Google sign-in not invoked; its code and label unchanged.
- Viewport and media emulation reset; owned tab closed. Both owned runtimes cleaned, synthetic scratch/credentials deleted and ports free.
- npm run verify:quality passed typechecks/lint, 115 backend tests and 139 app tests in 14 suites. No product tests added for a style-only assertion; runtime reproduction and measurements establish the regression.
- Acceptance: baseline cause, responsive image/theme/label and preserved controls satisfied by runtime observations and diff self-review; final export/checks passed.

- All-platform synthetic Expo export passed: /private/tmp/glosse-logo-export; iOS, Android and static web pages generated. No credentials or production configuration used.
- node scripts/check-agent-docs.mjs and git diff --check passed. Final runtime source fingerprint: 1d75eb3ae95b0c6db85471406b290eebdb59b3f43e54f67b905fa97d66ee1c18.

## Follow-up contract: centered Landing layout

- Status: complete; prior logo repair and its evidence remain complete.
- Authorization: user explicitly invoked grill-with-docs to remove the page header, constrain wide buttons and center the logo vertically/horizontally. Implementation awaits approval of this follow-up.
- Outcome: headerless Landing with the logo itself centered in the usable viewport and a centered, bounded sign-in column below it.
- Owned files: app/(root)/(auth)/index.tsx; app/(root)/(auth)/_layout.tsx (Landing screen options only); this record. Focused regression only if it exercises navigation behavior rather than duplicating styles.
- Out of scope: Settings, shared Container changes, SignInButton auth logic, email screen headers, asset redesign/replacement, copy changes, dependencies, commit/push/deployment.
- Assumptions: “this page” means Landing based on logo feedback; Settings being the active IDE tab does not expand scope. Preserve The Beauty App copy, center its alignment, retain logo.jpg and existing production/development sign-in choices.
- Proposed sizing: action column width=min(360, available width minus 48); logo remains capped at 320, with smaller sizing if required by available height. Use page-local layout rather than altering shared Container. Center the logo's bounding-box midpoint horizontally and vertically within the safe-area-adjusted visible page; place title/actions beneath with spacing. Centering the entire logo/title/button stack alone does not satisfy this request.
- Short-screen behavior: retain reachable controls using scroll fallback when geometric centering plus actions cannot fit without overlap; document this exception and verify no horizontal overflow.
- Research: source confirms headerShown=true for auth/index and flex-1/w-full button sizing inside an unbounded page. Prior browser evidence showed buttons spanning 1872px at a 1920px viewport. Expo Image and React Native sizing sources in the original contract remain applicable.
- Verification: actual isolated Expo web layout measurements and screenshots at desktop, 375x812 and 320x568 in light/dark themes; assert no Landing header, bounded button widths, logo midpoint within 2px of usable viewport midpoint when content fits, and short-screen controls accessible without overlap. Verify Email navigation and its existing header behavior. Run verify:quality, sequential all-platform synthetic export, docs checker and diff check; self-review final diff. No live OAuth or native-device readiness claim.
- Stop after: verified local/browser repair and self-review handoff; preserve all previous uncommitted changes.

### Follow-up acceptance criteria

- [x] Landing has no navigation header; email screen navigation remains intact.
- [x] Logo itself centered vertically and horizontally when page content fits, with responsive size and retained accessible label.
- [x] Google/Email actions share a centered column no wider than 360px and fit narrow viewports with 24px horizontal margins.
- [x] Title centered below logo; actions beneath it, with no overlap/clipping and scrolling on constrained heights.
- [x] Light/dark theme and existing auth choices preserved; checks and runtime proof recorded.

### Follow-up review and handoff

Self-review of web route and auth screen options: platform-specific route isolates all layout changes; native Landing remains SHA-256 fe34fd6e93f9fcebed8fadf5aa1f33ecd96883c1ebe566dda8b1f68d85bf02ba, identical to prior completed repair. No Settings/shared Container/auth logic edits. Header option explicitly web-only; email options preserved. No outstanding findings. Final web route SHA-256 a563dc2a071d733f77fbce99adc96512353c7aa5e4917ed7ff71e8e444a68a1d; layout 74ceb3eb7d4d079257d694ada091fd6e6ab63dc82dcb0b1ec1d6166d7e99d5c4.

### Follow-up executable evidence

- npm run verify:quality passed: typechecks, lint, 115 backend tests and 139 app tests. No extra tests duplicating layout styles added.
- Actual Chrome/Expo development web with disposable loopback backend; no login needed. Source fingerprint 5f24f314d4861469495371b7e649bb26b5e9d9b837600bb1a01afa92eedade6a; proof /private/tmp/glosse-centered-web.
- Desktop 1920x873: logo 320x320 at x800/y276.5, midpoint exactly (960,436.5), no header; button outer column 360px, Google inner measured 358px. desktop-dark.png retained.
- 375x812: logo 320x320 at x27.5/y246, midpoint exactly (187.5,406). Light/dark screenshots retained; bounded actions beneath centered title.
- 320x568: logo 272x272 at x24/y148, midpoint exactly (160,284); title and actions below without overlap. Keyboard focus scrolls Email into view; actual Email click opens /email/signin with existing close/header and login controls. small-scrolled.png retained.
- Browser viewport/theme emulation reset, tab closed. Owned runtime cleanup passed: processes absent, ports free, scratch/credentials removed.
- git diff --check and docs checker passed. Native device smoke and live OAuth unverified. Native layout preservation established by unchanged source fingerprint and platform branch; all-platform synthetic export passed (/private/tmp/glosse-centered-export).


- Follow-up approved with go after explicit web-only clarification. Owned files additionally include app/(root)/(auth)/index.web.tsx; native index.tsx is preserved from the prior completed repair. Layout header is hidden only for Platform.OS web, after shared options.

- Follow-up complete: web-only headerless Landing, centered logo and constrained action column. All acceptance items backed by browser measurements/screenshots, preserved native source, passing quality gate and iOS/Android/web exports. No commit/push/deploy.

## Static deployment regression

- User requested repair of flashing/collapsed Landing at https://glossenails--ipfc67e6la.expo.app/. This continues the approved web Landing contract. Owned files additionally include global.css for web-only responsive layout rules.
- Reproduced on preview and previous synthetic production export: viewport wide but logo/column derived from server width zero, resulting in 1px logo and vertically wrapped copy. Preview JavaScript bundle returns HTTP 200; local production export Email click successfully hydrates/navigates, so missing bundle/auth form is not the reproduced cause. Development-only checks had missed exported HTML behavior.
- Root cause: useWindowDimensions gives zero on server, producing inline widths/heights of 1px. Initial client viewport dimensions differ; hydration does not reliably repair those style attributes. Removed viewport-dependent inline sizing from index.web.tsx. Logo size and centering spacer now use responsive CSS viewport units; action column uses width 100% and maxWidth 360. No hooks needed for first-paint geometry, no asset/native/auth changes.
- Primary guidance: https://docs.expo.dev/router/web/static-rendering/ describes generated static HTML and production-export verification. Installed react-native-web Dimensions initializes server width/height to zero; installed hook uses state/effect rather than a server snapshot.
- Final all-platform synthetic export passed at /private/tmp/glosse-landing-static-fix. Served that production output on loopback 127.0.0.1:33216 with synthetic backend URL, without backend login or production data. Earlier reproduction served previous export at 33215.
- Chrome proof: desktop 1920x873 logo 320px at x800/y276.5, column 360; 375x812 logo 320px at x27.5/y246, midpoint y406 and column 327; 320x568 logo 272px at x24, midpoint y284, column 272 and document width 320 (no overflow). CSS-only reload with JavaScript disabled retains correct desktop/mobile geometry, proving first paint does not wait for hydration. Scripts reenabled; Email clicks on mobile/short screen open normal Login inputs and Show password. Screenshots /private/tmp/glosse-landing-static-proof/desktop.png, mobile-no-js.png and small-light.png.
- Quality passed: 115 backend / 143 app tests, typechecks/lints; focused Biome check passed. Self-review: page-local CSS names; preserve native index.tsx, header options, actions and short-screen scroll. User autofill edits untouched. Browser script/media/viewport overrides reset, owned tabs closed; loopback static servers stopped. Saved login/OAuth/native device/updated hosted deployment remain unverified.
- No commit/push/deploy. Preview still needs a fresh export/deployment to receive the local repair. Documentation/diff checks recorded after final update.
