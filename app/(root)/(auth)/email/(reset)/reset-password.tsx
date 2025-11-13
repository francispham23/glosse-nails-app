import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Link, useLocalSearchParams } from "expo-router";
import { Button, TextField, Spinner,useThemeColor } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";
import FormHeader, { FormContainer } from "@/components/form";

// TODO: Implement password reset logic here
export default function ResetPasswordRoute() {
	const mutedColor = useThemeColor("muted");
	const themeColorBackground = useThemeColor("background");
	const accentForegroundColor = useThemeColor("accent-foreground");
	// const router = useRouter();

	/**
	 * We are using proper routing to navigate to the reset password
	 * we receive the token from the email,
	 *
	 * check docs on the ERROR TYPE
	 * https://www.better-auth.com/docs/authentication/email-password#request-password-reset
	 *
	 */
	const { token, error } = useLocalSearchParams<{
		token: string;
		error?: string;
	}>();

	/* ---------------------------------- state --------------------------------- */
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading] = useState(false);

	/* ------------------------- handle reset password ------------------------- */
	// TODO: Implement password reset logic here
	/*
  const handleResetPassword = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your new password");
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
    const { error, data } = await authClient.resetPassword(
      {
        newPassword: password,
        token: token,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },

        onError: (ctx) => {
          setIsLoading(false);
          Alert.alert("Error", ctx.error.message || "Failed to reset password");
        },
        onSuccess: () => {
          setIsLoading(false);
          console.log("success!");
          Alert.alert("Success", "Password reset successfully");
          router.back();
        },
      }
    );
    console.log(data, error);
  };
  */

	/* --------------------------------- invalid token --------------------------------- */
	if (error === "INVALID_TOKEN" || !token) {
		return (
			<View className="flex-1 bg-background">
				<View className="flex-1 justify-center px-6">
					<View className="mb-8 text-center">
						<Text className="mb-4 font-bold text-2xl text-foreground">
							Invalid Link
						</Text>
						<Text className="text-muted-foreground">
							This reset link has already been used or is invalid
						</Text>
					</View>
					<Link href="/(root)/(auth)/email/signin" asChild>
						<Button className="rounded-3xl">
								<Ionicons
									name="arrow-back-outline"
									size={16}
									color={accentForegroundColor}
								/>
							<Button.Label>Back to Sign In</Button.Label>
						</Button>
					</Link>
				</View>
			</View>
		);
	}

	/* --------------------------------- return --------------------------------- */
	return (
		<FormContainer>
			{/* header */}
			<FormHeader
				title="Reset Password"
				description="Enter your new password to complete the reset"
			/>
			{/* new password */}
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter your new password"
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				>
					<TextField.InputStartContent className="pointer-events-none">
						<Ionicons
							name="lock-closed-outline"
							size={16}
							color={mutedColor}
						/>
					</TextField.InputStartContent>
					<TextField.InputEndContent className="pointer-events-none">
						<Ionicons
							name="eye-outline"
							size={16}
							color={mutedColor}
						/>
					</TextField.InputEndContent>
				</TextField.Input>
			</TextField>
			{/* confirm password */}
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Confirm your new password"
					secureTextEntry
					value={confirmPassword}
					onChangeText={setConfirmPassword}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons
							name="lock-closed-outline"
							size={20}
							color={mutedColor}
						/>
					</TextField.InputStartContent>
					<TextField.InputEndContent className="pointer-events-none pr-2">
						<Ionicons
							name="checkmark-outline"
							size={20}
							color={mutedColor}
						/>
					</TextField.InputEndContent>
				</TextField.Input>
			</TextField>
			{/* submit button */}
			<Button
        // onPress={handleResetPassword}
        isDisabled={isLoading}
        className="rounded-3xl"
        size="lg"
      >
        <Button.Label>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button.Label>
          {isLoading ? <Spinner color={themeColorBackground} /> : null}
      </Button>
		</FormContainer>
	);
}
