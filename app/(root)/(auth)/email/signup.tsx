import { useAuthActions } from "@convex-dev/auth/react";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Link } from "expo-router";
import { Button, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Text } from "react-native";

import FormHeader, { FormContainer } from "@/components/form";

export default function SignUpRoute() {
	const { signIn } = useAuthActions();
	const mutedColor = useThemeColor("muted");
	const themeColorBackground = useThemeColor("background");

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
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter your full name"
					autoCapitalize="words"
					value={name}
					onChangeText={setName}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="person-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>
			{/* email */}
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter your email"
					keyboardType="email-address"
					autoCapitalize="none"
					value={email}
					onChangeText={setEmail}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="mail-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>
			{/* password */}
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter your password"
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="lock-closed-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
					<TextField.InputEndContent className="pointer-events-none pr-2">
						<Ionicons name="eye-outline" size={20} color={mutedColor} />
					</TextField.InputEndContent>
				</TextField.Input>
			</TextField>
			{/* confirm password */}
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Confirm your password"
					secureTextEntry
					value={confirmPassword}
					onChangeText={setConfirmPassword}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="lock-closed-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
					<TextField.InputEndContent className="pointer-events-none pr-2">
						<Ionicons name="checkmark-outline" size={20} color={mutedColor} />
					</TextField.InputEndContent>
				</TextField.Input>
			</TextField>
			{/* submit button */}
			<Button
				onPress={handleSignUp}
				isDisabled={isLoading}
				className="rounded-3xl"
				size="lg"
			>
				<Button.Label>
					{isLoading ? "Creating Account..." : "Sign Up"}
				</Button.Label>
				{isLoading ? <Spinner color={themeColorBackground} /> : null}
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
