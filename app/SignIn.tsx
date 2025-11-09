import { useAuthActions } from "@convex-dev/auth/react";
import { makeRedirectUri } from "expo-auth-session";
import { openAuthSessionAsync } from "expo-web-browser";
import { Button, Platform } from "react-native";

const redirectTo = makeRedirectUri();

//? Doc: https://labs.convex.dev/auth/config/oauth#add-sign-in-button
export default function SignIn() {
  const { signIn } = useAuthActions();
  const handleSignIn = async () => {
    const { redirect } = await signIn("google", { redirectTo });
    if (Platform.OS === "web") {
      return;
    }
    const result = await openAuthSessionAsync(redirect!.toString(), redirectTo);
    if (result.type === "success") {
      const { url } = result;
      const code = new URL(url).searchParams.get("code")!;
      await signIn("google", { code });
    }
  };
  return <Button onPress={handleSignIn} title="Sign in with Google" />;
}
