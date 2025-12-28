import { useAuthActions } from "@convex-dev/auth/react";
import { makeRedirectUri } from "expo-auth-session";
import { openAuthSessionAsync } from "expo-web-browser";
import { Button, Platform } from "react-native";

const redirectTo = makeRedirectUri();

//? Doc: https://labs.convex.dev/auth/config/oauth#add-sign-in-button
export default function SignInButton() {
	const { signIn } = useAuthActions();
	const handleSignIn = async () => {
		const { redirect } = await signIn("google", { redirectTo });

		if (Platform.OS === "web") {
			return;
		}

		if (!redirect) {
			console.warn("Redirect URL is missing.");
			return;
		}

		const result = await openAuthSessionAsync(redirect.toString(), redirectTo);
		if (result.type === "success") {
			const { url } = result;
			const code = new URL(url).searchParams.get("code");
			if (code) {
				await signIn("google", { code });
			} else {
				// Handle missing code error, e.g., show an alert or log
				console.warn("Authorization code not found in redirect URL.");
			}
		}
	};

	return <Button onPress={handleSignIn} title="Sign in with Google" />;
}
