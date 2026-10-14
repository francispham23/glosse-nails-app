import { useAuthActions } from "@convex-dev/auth/react";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Platform, Text } from "react-native";
import { Button, TextInput } from "react-native-paper";
import FormHeader, { FormContainer } from "@/components/Form/form";
import { PasswordInput } from "@/components/Form/password-input";
import { isProduction, useThemeColor } from "@/utils";

export default function SignInRoute() {
	const { signIn } = useAuthActions();

	const accentForegroundColor = useThemeColor("accent");

	/* ---------------------------------- state --------------------------------- */
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const submitting = useRef(false);
	const showError = (title: string, description: string) => {
		if (Platform.OS === "web") setMessage(description);
		else Alert.alert(title, description);
	};

	/* ----------------------------- handle sign in ----------------------------- */
	const handleSignIn = async () => {
		if (submitting.current) return;
		setMessage(null);
		if (!email.trim()) {
			showError("Error", "Please enter your email");
			return;
		}
		if (!password) {
			showError("Error", "Please enter your password");
			return;
		}

		submitting.current = true;
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
			const description = error instanceof Error ? error.message : "";
			showError(
				"Sign In Failed",
				/InvalidAccountId|InvalidSecret/i.test(description)
					? "Invalid email or password. Please try again."
					: description && !description.startsWith("[CONVEX")
						? description
						: "Unable to sign in. Please try again.",
			);
		} finally {
			submitting.current = false;
			setIsLoading(false);
		}
	};

	/* --------------------------------- return --------------------------------- */
	return (
		<FormContainer webForm onSubmit={handleSignIn}>
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
				autoComplete="username"
				autoCorrect={false}
				value={email}
				onChangeText={setEmail}
				left={<TextInput.Icon icon="email-outline" />}
				className="h-16 rounded-3xl"
			/>
			{/* password text-field */}
			<PasswordInput
				mode="outlined"
				placeholder="Enter your password"
				visibilityLabel="password"
				autoComplete="current-password"
				value={password}
				onChangeText={setPassword}
				left={<TextInput.Icon icon="form-textbox-password" />}
				className="h-16 rounded-3xl"
			/>

			{/* submit button */}
			{message ? (
				<Text accessibilityRole="alert" className="text-error">
					{message}
				</Text>
			) : null}
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
			{!isProduction ? (
				<Link
					href="/(root)/(auth)/email/(reset)/request-password-reset"
					asChild
				>
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
			) : null}
		</FormContainer>
	);
}
