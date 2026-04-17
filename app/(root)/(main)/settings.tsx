import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import Animated from "react-native-reanimated";

import FormHeader, { FormContainer } from "@/components/Form/form";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { cn } from "@/utils";

export default function SettingsRoute() {
	const { isLight } = useAppTheme();
	const user = useQuery(api.users.viewer);
	const changePassword = useAction(api.users.changePassword);

	const { signOut } = useAuthActions();

	const [isSigningOut, setIsSigningOut] = useState(false);
	const [isResettingPassword, setIsResettingPassword] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const className = cn("text-lg text-muted", !isLight && "text-gray-300");

	const handleChangePassword = async () => {
		if (!oldPassword) {
			Alert.alert("Error", "Please enter your current password");
			return;
		}

		if (!newPassword) {
			Alert.alert("Error", "Please enter your new password");
			return;
		}

		if (newPassword.length < 8) {
			Alert.alert("Error", "New password must be at least 8 characters");
			return;
		}

		if (newPassword !== confirmNewPassword) {
			Alert.alert("Error", "New passwords do not match");
			return;
		}

		setIsLoading(true);
		try {
			await changePassword({
				oldPassword,
				newPassword,
				email: user?.email || "",
			});

			setOldPassword("");
			setNewPassword("");
			setConfirmNewPassword("");
			Alert.alert("Success", "Password updated successfully.");
			setIsResettingPassword(false);
		} catch (error) {
			console.error("Change password error:", error);
			Alert.alert(
				"Change Password Failed",
				error instanceof Error
					? error.message
					: "Could not change password. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (!user)
		return <ActivityIndicator className="flex-1 items-center justify-center" />;

	return (
		<Animated.View className="flex-1">
			<ScrollView
				contentInsetAdjustmentBehavior="always"
				contentContainerClassName="px-6 py-2 gap-4 min-h-full "
			>
				{isResettingPassword ? (
					<FormContainer>
						{/* header */}
						<FormHeader
							title="Change Password"
							description="Enter your current password and set a new one"
						/>
						<TextInput
							mode="outlined"
							placeholder="Current password"
							secureTextEntry
							value={oldPassword}
							onChangeText={setOldPassword}
							left={<TextInput.Icon icon="lock-outline" />}
							className="h-16 rounded-3xl"
						/>
						<TextInput
							mode="outlined"
							placeholder="New password"
							secureTextEntry
							value={newPassword}
							onChangeText={setNewPassword}
							left={<TextInput.Icon icon="lock-reset" />}
							className="h-16 rounded-3xl"
						/>
						<TextInput
							mode="outlined"
							placeholder="Confirm new password"
							secureTextEntry
							value={confirmNewPassword}
							onChangeText={setConfirmNewPassword}
							left={<TextInput.Icon icon="lock-check-outline" />}
							className="h-16 rounded-3xl"
						/>
						{/* submit button */}
						<Button
							onPress={handleChangePassword}
							disabled={isLoading}
							mode="contained"
							loading={isLoading}
							className="rounded-3xl"
						>
							{isLoading ? "Updating..." : "Update Password"}
						</Button>
						<Button
							onPress={() => setIsResettingPassword(false)}
							mode="text"
							disabled={isLoading}
							className="rounded-3xl"
						>
							Cancel
						</Button>
					</FormContainer>
				) : (
					<View className="gap-1">
						<Text
							className={cn("font-bold text-2xl", !isLight && "text-white")}
						>
							User Info Section
						</Text>
						<View className="flex">
							<Text className={className}>{user.name}</Text>
							<Text className={className}>{user.email}</Text>
							<Text className={className}>
								created {new Date(user._creationTime).toDateString()}
							</Text>
						</View>
						<View className="mt-4 flex-row justify-end gap-4">
							<Button
								mode="outlined"
								className="self-start rounded-full"
								disabled={isResettingPassword}
								loading={isResettingPassword}
								onPress={async () => {
									Alert.alert(
										"Reset Password",
										"Are you sure you want to reset your password?",
										[
											{
												text: "Cancel",
												style: "cancel",
											},
											{
												text: "Reset Password",
												onPress: () => {
													setIsResettingPassword(true);
												},
											},
										],
									);
								}}
							>
								Reset Password
							</Button>

							<Button
								mode="outlined"
								className="self-start rounded-full"
								disabled={isSigningOut}
								loading={isSigningOut}
								onPress={async () => {
									setIsSigningOut(true);
									Alert.alert(
										"Sign Out",
										"Are you sure you want to sign out?",
										[
											{
												text: "Cancel",
												style: "cancel",
											},
											{
												text: "Sign Out",
												onPress: () => {
													void signOut();
												},
											},
										],
									);
									setIsSigningOut(false);
								}}
							>
								{isSigningOut ? "Signing Out..." : "Sign Out"}
							</Button>
						</View>
					</View>
				)}
			</ScrollView>
		</Animated.View>
	);
}
