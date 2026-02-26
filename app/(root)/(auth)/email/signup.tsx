import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";
import { Button, TextInput } from "react-native-paper";

import FormHeader, { FormContainer } from "@/components/Form/form";

export default function SignUpRoute() {
	const { signIn } = useAuthActions();

	/* ---------------------------------- state --------------------------------- */
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	/* ------------------------------ handle signup ----------------------------- */
	const handleSignUp = async () => {
		if (!name.trim()) {
			Alert.alert("Error", "Please enter your name");
			return;
		}

		if (!email.trim()) {
			Alert.alert("Error", "Please enter your email");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Error", "Passwords don't match");
			return;
		}

		if (password.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);
		try {
			await signIn("password", {
				email: email.trim().toLowerCase(),
				password,
				name: name.trim(),
				flow: "signUp",
			});
			// Navigation handled automatically by auth state change
		} catch (error) {
			console.error("Sign up error:", error);
			Alert.alert(
				"Sign Up Failed",
				error instanceof Error
					? error.message
					: "Unable to create account. Please try again.",
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
				title="Sign Up"
				description="Create your account to get started"
			/>
			{/* name */}
			<TextInput
				mode="outlined"
				placeholder="Enter your full name"
				autoCapitalize="words"
				value={name}
				onChangeText={setName}
				left={<TextInput.Icon icon="account-outline" />}
				className="h-16 rounded-3xl"
			/>
			{/* email */}
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
			{/* password */}
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
			{/* confirm password */}
			<TextInput
				mode="outlined"
				placeholder="Confirm your password"
				secureTextEntry
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				left={<TextInput.Icon icon="form-textbox-password" />}
				right={<TextInput.Icon icon="eye-check-outline" />}
				className="h-16 rounded-3xl"
			/>
			{/* submit button */}
			<Button
				onPress={handleSignUp}
				disabled={isLoading}
				mode="contained"
				loading={isLoading}
				className="rounded-3xl"
			>
				{isLoading ? "Creating Account..." : "Sign Up"}
			</Button>
			<Text className="px-14 text-center text-muted-foreground text-sm">
				by continuing you agree to our{" "}
				<Link href="http://convex.dev" className="text-foreground underline">
					terms of service
				</Link>{" "}
				and{" "}
				<Link href="http://convex.dev" className="text-foreground underline">
					privacy policy
				</Link>
			</Text>
		</FormContainer>
	);
}
