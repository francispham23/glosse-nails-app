import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Google],
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
				throw new Error(
					`Invalid redirectTo URI ${redirectTo} — no allowed redirect schemes configured`,
				);
			}

			for (const scheme of allowed) {
				if (uri.startsWith(`${scheme}://`)) return redirectTo;
			}

			throw new Error(`Invalid redirectTo URI ${redirectTo}`);
		},
	},
});
