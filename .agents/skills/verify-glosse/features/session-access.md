# Session and access: evidence boundaries

Launch creates four synthetic Password accounts under example.invalid with
run-prefixed emails: manager index0, active technicians1/2, inactive technician3.
The real API harness verifies roles, active state and denied operations. Doctor
reads saved synthetic tokens via public viewerAccess and checks each stored user
identity/activity; it performs no sign-in or financial mutation.

Browser pilot signs in active technician1 through the actual email/password form
and navigates the seeded shift/card. It does not exercise inactive-role UX,
Google OAuth, native SecureStore, session expiry/refresh, or production identity
providers. Keep credentials private; only redacted post-login financial screens
belong in retained proof. Read [access policy](../../../../docs/access-policy.md)
when preparing any broader session contract.
