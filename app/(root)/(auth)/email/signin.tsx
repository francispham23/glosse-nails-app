import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Link } from "expo-router";
import { Button, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert } from "react-native";

import FormHeader, { FormContainer } from "@/components/form";

// TODO: Implement sign-in logic with Convex Auth
export default function SignInRoute() {
	const mutedColor = useThemeColor("muted");
	const themeColorBackground = useThemeColor("background");
	const accentForegroundColor = useThemeColor("accent-foreground");

	/* ---------------------------------- state --------------------------------- */
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading] = useState(false);

	/* ----------------------------- handle sign in ----------------------------- */
	const handleSignIn = async () => {
		/**
		 * FEAT: Add your own form validation validation here
		 * i've been using tanstack form for react native with zod
		 *
		 * but this is just a base for you to get started
		 */
		if (!email.trim()) {
			Alert.alert("Error", "Please enter your email");
			return;
		}
		if (!password) {
			Alert.alert("Error", "Please enter your password");
			return;
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
			{/* password text-field */}
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

			{/* submit button */}
			<Button
				onPress={handleSignIn}
				isDisabled={isLoading}
				size="lg"
				className="rounded-3xl"
			>
				<Button.Label>{isLoading ? "Signing In..." : "Sign In"}</Button.Label>
				{isLoading ? <Spinner color={themeColorBackground} /> : null}
			</Button>
			{/* forgot password route */}
			<Link href="/(root)/(auth)/email/(reset)/request-password-reset" asChild>
				<Button
					variant="tertiary"
					size="sm"
					className="self-center rounded-3xl"
				>
					<Ionicons
						name="lock-closed-outline"
						size={14}
						color={accentForegroundColor}
					/>
					<Button.Label className="mx-1">Forgot Password?</Button.Label>
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
