import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async redirect({ redirectTo }) {
      // Allow common development redirect URIs used by Expo and localhost,
      // and the Expo AuthSession proxy redirect (https://auth.expo.io/...).
      // This accepts any exp:// host (device IPs can vary), localhost, and
      // Expo proxy URIs. We keep the check conservative to avoid accepting
      // arbitrary external URLs.
      const uri = String(redirectTo || "");
      const isExpScheme = uri.startsWith("exp://");
      const isLocalhost = uri.startsWith("http://localhost");
      const isExpoProxy = uri.startsWith("https://auth.expo.io");

      if (!isExpScheme && !isLocalhost && !isExpoProxy) {
        throw new Error(`Invalid redirectTo URI ${redirectTo}`);
      }

      return redirectTo;
    },
  },
});
