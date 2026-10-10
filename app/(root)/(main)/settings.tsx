import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useQuery } from "convex/react";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Platform,
	ScrollView,
	Text,
	View,
} from "react-native";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import Animated from "react-native-reanimated";
import FormHeader, { FormContainer } from "@/components/Form/form";
import { PasswordInput } from "@/components/Form/password-input";
import { api } from "@/convex/_generated/api";
import { cn } from "@/utils";

export default function SettingsRoute() {
	const user = useQuery(api.users.viewer);
	const changePassword = useAction(api.users.changePassword);

	const { signOut } = useAuthActions();

	const [isSigningOut, setIsSigningOut] = useState(false);
	const [isResettingPassword, setIsResettingPassword] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const signingOut = useRef(false);
	const [dialog, setDialog] = useState<{
		title: string;
		message: string;
		confirmLabel?: string;
		onConfirm?: () => void;
	} | null>(null);

	const showMessage = (title: string, message: string) => {
		if (Platform.OS === "web") setDialog({ title, message });
		else Alert.alert(title, message);
	};

	const confirmAction = (
		title: string,
		message: string,
		onConfirm: () => void,
	) => {
		if (Platform.OS === "web") {
			setDialog({ title, message, confirmLabel: title, onConfirm });
		} else {
			Alert.alert(title, message, [
				{ text: "Cancel", style: "cancel" },
				{ text: title, onPress: onConfirm },
			]);
		}
	};

	const handleSignOut = async () => {
		if (signingOut.current) return;
		signingOut.current = true;
		setIsSigningOut(true);
		try {
			await signOut();
		} catch (error) {
			showMessage(
				"Sign Out Failed",
				error instanceof Error
					? error.message
					: "Could not sign out. Please try again.",
			);
		} finally {
			signingOut.current = false;
			setIsSigningOut(false);
		}
	};

	const className = cn("text-lg text-muted");

	const handleChangePassword = async () => {
		if (!oldPassword) {
			showMessage("Error", "Please enter your current password");
			return;
		}

		if (!newPassword) {
			showMessage("Error", "Please enter your new password");
			return;
		}

		if (newPassword.length < 8) {
			showMessage("Error", "New password must be at least 8 characters");
			return;
		}

		if (newPassword !== confirmNewPassword) {
			showMessage("Error", "New passwords do not match");
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
			showMessage("Success", "Password updated successfully.");
			setIsResettingPassword(false);
		} catch (error) {
			console.error("Change password error:", error);
			showMessage(
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
						<PasswordInput
							mode="outlined"
							placeholder="Current password"
							visibilityLabel="current password"
							value={oldPassword}
							onChangeText={setOldPassword}
							left={<TextInput.Icon icon="lock-outline" />}
							className="h-16 rounded-3xl"
						/>
						<PasswordInput
							mode="outlined"
							placeholder="New password"
							visibilityLabel="new password"
							value={newPassword}
							onChangeText={setNewPassword}
							left={<TextInput.Icon icon="lock-reset" />}
							className="h-16 rounded-3xl"
						/>
						<PasswordInput
							mode="outlined"
							placeholder="Confirm new password"
							visibilityLabel="new password confirmation"
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
								onPress={() =>
									confirmAction(
										"Reset Password",
										"Are you sure you want to reset your password?",
										() => setIsResettingPassword(true),
									)
								}
							>
								Reset Password
							</Button>

							<Button
								mode="outlined"
								className="self-start rounded-full"
								disabled={isSigningOut}
								loading={isSigningOut}
								onPress={() =>
									confirmAction(
										"Sign Out",
										"Are you sure you want to sign out?",
										() => {
											void handleSignOut();
										},
									)
								}
							>
								{isSigningOut ? "Signing Out..." : "Sign Out"}
							</Button>
						</View>
					</View>
				)}
			</ScrollView>
			{Platform.OS === "web" && dialog && (
				<Portal>
					<Dialog visible onDismiss={() => setDialog(null)}>
						<Dialog.Title>{dialog.title}</Dialog.Title>
						<Dialog.Content>
							<Text>{dialog.message}</Text>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={() => setDialog(null)}>
								{dialog.onConfirm ? "Cancel" : "OK"}
							</Button>
							{dialog.onConfirm && (
								<Button
									onPress={() => {
										const confirm = dialog.onConfirm;
										setDialog(null);
										confirm?.();
									}}
								>
									{dialog.confirmLabel}
								</Button>
							)}
						</Dialog.Actions>
					</Dialog>
				</Portal>
			)}
		</Animated.View>
	);
}
