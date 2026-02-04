import { useAuthActions } from "@convex-dev/auth/react";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { Button, TextInput } from "react-native-paper";

import FormHeader, { FormContainer } from "@/components/form";
import { useThemeColor } from "@/utils";

export default function SignInRoute() {
	const { signIn } = useAuthActions();

	const accentForegroundColor = useThemeColor("accent-foreground");

	/* ---------------------------------- state --------------------------------- */
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	/* ----------------------------- handle sign in ----------------------------- */
	const handleSignIn = async () => {
		if (!email.trim()) {
			Alert.alert("Error", "Please enter your email");
			return;
		}
		if (!password) {
			Alert.alert("Error", "Please enter your password");
			return;
		}

		setIsLoading(true);
		try {
			await signIn("password", {
				email: email.trim().toLowerCase(),
				password,
				flow: "signIn",
			});
			// Navigation handled automatically by auth state change
		} catch (error) {
			console.error("Sign in error:", error);
			Alert.alert(
				"Sign In Failed",
				error instanceof Error
					? error.message
					: "Invalid email or password. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	/* --------------------------------- return --------------------------------- */
	return (
		<FormContainer>
			{/* header */}
			<FormHeader
				title="Login"
				description="Enter your email and password to login"
			/>

			{/* email text-field*/}
			<TextInput
				mode="outlined"
				placeholder="Enter your email"
				keyboardType="email-address"
				autoCapitalize="none"
				value={email}
				onChangeText={setEmail}
				left={<TextInput.Icon icon="email-outline" />}
				className="h-16 rounded-3xl"
			/>
			{/* password text-field */}
			<TextInput
				mode="outlined"
				placeholder="Enter your password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
				left={<TextInput.Icon icon="form-textbox-password" />}
				right={<TextInput.Icon icon="eye-outline" />}
				className="h-16 rounded-3xl"
			/>

			{/* submit button */}
			<Button
				onPress={handleSignIn}
				disabled={isLoading}
				mode="contained"
				loading={isLoading}
				className="rounded-3xl"
			>
				{isLoading ? "Signing In..." : "Sign In"}
			</Button>
			{/* forgot password route */}
			<Link href="/(root)/(auth)/email/(reset)/request-password-reset" asChild>
				<Button mode="text" className="self-center rounded-3xl">
					<Ionicons
						name="lock-closed-outline"
						size={14}
						color={accentForegroundColor}
					/>
					{"  "}Forgot Password?{"  "}
					<Ionicons
						name="chevron-forward"
						size={16}
						color={accentForegroundColor}
					/>
				</Button>
			</Link>
		</FormContainer>
	);
}
