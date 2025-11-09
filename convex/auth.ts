import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async redirect({ redirectTo }) {
      if (
        redirectTo !== "exp://10.0.0.2:8081" &&
        redirectTo !== "http://localhost:8081"
      ) {
        throw new Error(`Invalid redirectTo URI ${redirectTo}`);
      }
      return redirectTo;
    },
  },
});
