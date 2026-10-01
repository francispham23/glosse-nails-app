import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { resolveRedirect } from "./redirectPolicy";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Google, Password],
	callbacks: {
		async redirect({ redirectTo }) {
			return resolveRedirect(redirectTo, {
				allowedSchemes: process.env.ALLOWED_REDIRECT_SCHEMES,
				expoScheme: process.env.EXPO_SCHEME,
				allowedOrigins: process.env.ALLOWED_REDIRECT_ORIGINS,
				siteUrl: process.env.SITE_URL,
				allowDevelopment: process.env.ALLOW_DEVELOPMENT_REDIRECTS === "true",
				developmentOrigins: process.env.DEVELOPMENT_REDIRECT_ORIGINS,
			});
		},
	},
});
