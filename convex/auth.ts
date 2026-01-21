import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Google, Password],
	callbacks: {
		async redirect({ redirectTo }) {
			// Validate redirectTo against a configured allow-list to prevent
			// arbitrary redirects. Allowed entries come from the
			// `ALLOWED_REDIRECT_SCHEMES` env var (comma-separated) and a few
			// trusted defaults used for development.
			const uri = String(redirectTo || "");

			const trustedPrefixes = [
				"exp://",
				"http://localhost",
				"https://auth.expo.io",
			];
			for (const p of trustedPrefixes) {
				if (uri.startsWith(p)) return redirectTo;
			}

			// Read allowed schemes from env. Expect a comma-separated list of
			// scheme names (e.g. `glossenailapp,myapp`). We match against
			// `${scheme}://` prefix. If the env var is missing, we reject by
			// default (fail-safe).
			const allowedRaw = process.env.ALLOWED_REDIRECT_SCHEMES || "";
			const allowed = allowedRaw
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);

			if (allowed.length === 0) {
				// No explicit allow-list configured. As a safer fallback,
				// accept the scheme from `EXPO_SCHEME` if present (this is
				// commonly set for Expo builds). Otherwise, fail with a
				// helpful error telling the operator how to fix it in prod.
				const expoScheme = process.env.EXPO_SCHEME;
				if (expoScheme && uri.startsWith(`${expoScheme}://`)) {
					console.warn(
						"ALLOWED_REDIRECT_SCHEMES not set; allowing redirect via EXPO_SCHEME",
					);
					return redirectTo;
				}

				throw new Error(
					`Invalid redirectTo URI ${redirectTo} — no allowed redirect schemes configured. Set the environment variable ALLOWED_REDIRECT_SCHEMES=glossenailapp (comma-separated) in your Convex/runtime environment, or set EXPO_SCHEME to permit a single scheme.`,
				);
			}

			for (const scheme of allowed) {
				if (uri.startsWith(`${scheme}://`)) return redirectTo;
			}

			throw new Error(
				`Invalid redirectTo URI ${redirectTo}. Allowed schemes: ${allowed.join(",")}`,
			);
		},
	},
});
