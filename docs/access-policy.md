# Phase 1 backend access policy

This patch protects the existing single-business app. It does not introduce
tenant isolation: do not onboard unrelated businesses until the tenancy phase.
Authentication identifies the caller; an active `staffRoles` record grants
operational access. Request flags, dates and supplied user IDs never establish
the caller's identity or permission.

## Public function inventory

- `auth.signIn`, `auth.signOut`, `auth.isAuthenticated` and auth HTTP routes:
  intentionally exposed framework-managed authentication; no blanket staff check.
  `auth.store` is an internal mutation maintained by Convex Auth.
- `users.viewerAccess`: public bootstrap. Anonymous callers receive access status
  only; signed-in callers receive their own account/status, including when their
  role is missing/inactive. `isAuthorized` retains its management-area meaning.
- `users.viewer`, `users.viewerRole`: active staff, caller's own profile/role.
- `users.usersByDateRange`: active staff; technicians see themselves, managers and
  owners see all. `report` changes calculation/display semantics, never access.
- `users.getUserById`: active staff, self or owner/manager. Missing ID returns null
  after authentication, not an unauthenticated shortcut.
- `users.changePassword`: signed-in account owner plus valid old password. Staff
  access is not required to maintain one's own credentials. The returned account
  owner must match the authenticated caller before credential/session changes.
- `transactions.listByDateRange`, `transactions.listByGiftCard`: active staff;
  technicians see their own rows, owners/managers see all. Date/report flags cannot
  broaden the scope. Gift-card shared operational access does not expose other
  technicians' transaction details through this alternate list endpoint.
- `transactions.listByTechnicianAndDateRange`, `transactions.getById`: active
  staff, self or owner/manager. Stored ownership protects detail lookups.
- `transactions.addTransaction`: active staff, self or owner/manager.
- `transactions.updateTransaction`: active staff; both stored and requested
  technician must be permitted. A technician cannot acquire another's record by
  submitting their own ID, or transfer their own record to another technician.
- `transactions.deleteTransaction`: owner/manager only.
- `giftCards.list`, `giftCards.getByCode`, `giftCards.listByDateRange`: active staff
  shared operational gift-card catalog and date-range data, including codes,
  original values, balances and transaction IDs. This policy does not give
  unauthenticated clients a public balance checker. `getByCode.transactionId`
  additionally requires self/management access to that stored transaction before
  excluding its redemption from a quote. An owned transaction may select a new
  gift card; if it did not redeem that card, the exclusion has no effect.
- `giftCards.create`, `giftCards.deleteGiftCard`: owner/manager only.
- `shifts.getShiftByDate`: active staff; shared directory contains ID, creation
  timestamp, name and image only, not email, phone or account verification fields.
- `shifts.saveShift`: owner/manager only.
- `categories.getFormCategories`: active staff; shared form catalog.

No public kiosk dataset is defined in this phase. If required later, add an
explicit bounded endpoint with an approved minimal response instead of reopening
these operational endpoints. Existing aggregation, pagination and money validation
are intentionally separate work; this patch is not a complete financial audit.

## Callback configuration before deployment

Configure these on the **Convex deployment**. EAS build environment variables
alone do not configure backend callbacks. This task does not change deployment
environment variables or run a deployment.

- `ALLOWED_REDIRECT_SCHEMES=glossenailapp` permits the configured native app scheme.
  `EXPO_SCHEME=glossenailapp` is a fallback only when the list is empty. Web,
  executable and Expo Go schemes cannot be allowed through this setting.
- `SITE_URL=https://your-app.example` permits that HTTPS origin and resolves
  root-relative callbacks against it.
- `ALLOWED_REDIRECT_ORIGINS=https://your-app.example` permits explicit HTTPS origins.
  Include `https://auth.expo.io` only if the application actually uses that proxy.
  Matching compares parsed protocol/host/port, not a string prefix. Paths do not
  narrow an origin allowlist; list origins, not callback-specific URL paths.
- Development only: `ALLOW_DEVELOPMENT_REDIRECTS=true` plus
  `DEVELOPMENT_REDIRECT_ORIGINS=http://localhost:8081,exp://192.0.2.1:8081`.
  Replace the example Expo host/port with the actual development origin. There
  are no wildcard hosts or ports. HTTP is restricted to loopback hosts; Expo Go
  origins must match exactly. Keep development opt-in disabled in production.

Do not place tokens or credentials in these settings. Credentials in callback
URLs, control characters, backslashes, protocol-relative URLs, and lookalike hosts
are rejected. Error messages do not echo potentially sensitive callback URLs.

## Verification and limits

`npm run verify:backend` checks both TypeScript projects, backend lint and the
function tests. Authorization tests execute the real function and auth helper
logic against `convex-test`; callback tests capture and invoke the real registered
callback; password tests simulate credential-provider operations while retaining
the actual caller-identity and ownership checks.

Before release, test real sign-in/refresh/logout and callbacks in an explicitly
authorized preview environment with active, inactive and unapproved accounts.
The existing UI may surface backend access errors for unauthorized screens; a
polished access-denied flow is part of user-journey work. No OAuth/device test or
real deployment is implied by a passing simulated backend test suite.
