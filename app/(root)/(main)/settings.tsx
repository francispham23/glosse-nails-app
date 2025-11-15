import { useAuthActions } from "@convex-dev/auth/react";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { Button, Spinner, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { api } from "@/convex/_generated/api";

export default function SettingsRoute() {
	const themeColorForeground = useThemeColor("foreground");
	const [isDeletingUser, setIsDeletingUser] = useState(false);
	const user = useQuery(api.users.viewer);
	const deleteViewer = useMutation(api.users.deleteViewer);
	const { signOut } = useAuthActions();

	if (!user) return null;

	const handleDeleteUser = async () => {
		setIsDeletingUser(true);
		try {
			await deleteViewer();
			// Optionally, you might want to sign the user out or navigate away after deletion
		} catch (error) {
			console.error("Error deleting user:", error);
		} finally {
			setIsDeletingUser(false);
			signOut();
		}
	};

	return (
		<View className="flex-1">
			<ScrollView
				contentInsetAdjustmentBehavior="always"
				contentContainerClassName="px-6 py-2 gap-4 min-h-full "
			>
				<Text className="font-bold text-2xl">User Info Section</Text>
				<View className="flex">
					<Text className="text-lg text-muted-foreground">{user.name}</Text>
					<Text className="text-lg text-muted-foreground">{user.email}</Text>
					<Text className="text-lg text-muted-foreground">
						created {new Date(user._creationTime).toDateString()}
					</Text>
				</View>
				{/* Delete User*/}
				<View className="flex gap-4">
					<Button
						variant="tertiary"
						size="sm"
						className="self-start rounded-full"
						isDisabled={isDeletingUser}
						onPress={async () => {
							Alert.alert(
								"Delete User",
								"Are you sure you want to delete your account?",
								[
									{
										text: "Cancel",
										style: "cancel",
									},
									{
										text: "Delete",
										onPress: async () => {
											await handleDeleteUser();
										},
									},
								],
							);
						}}
					>
						<Ionicons
							name="trash-outline"
							size={18}
							color={themeColorForeground}
						/>
						<Button.Label>
							{isDeletingUser ? "Deleting..." : "Delete User"}
						</Button.Label>
						{isDeletingUser ? <Spinner color={themeColorForeground} /> : null}
					</Button>
				</View>
			</ScrollView>
		</View>
	);
}
