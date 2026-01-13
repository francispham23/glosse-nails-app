import { useAuthActions } from "@convex-dev/auth/react";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "convex/react";
import { Button, cn, Spinner, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useLoadTransactions } from "@/hooks/useLoadTransactions";

export default function SettingsRoute() {
	const { isLight } = useAppTheme();
	const themeColorForeground = useThemeColor("foreground");
	const user = useQuery(api.users.viewer);

	const postTransactions = useMutation(api.transactions.bulkInsertTransactions);
	const { signOut } = useAuthActions();

	const [checkout, setCheckout] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);
	// get today's transactions from async storage
	const { transactions } = useLoadTransactions(
		api.transactions.listByDateRange,
	);

	const handleCheckout = async () => {
		setCheckout(true);
		try {
			const formattedTransactions = transactions.map((tx) => ({
				technicianId: tx.technician as Id<"users">, // Convert technician to technicianId
				clientId: tx.client as Id<"users">, // Convert client to clientId
				compensation: String(tx.compensation), // Convert to string
				tip: String(tx.tip), // Convert to string
				serviceDate: tx.serviceDate ?? Date.now(), // Ensure serviceDate is present
				services: tx.services as Id<"categories">[] | undefined, // Keep services array
			}));
			// Post transactions to Convex backend
			await postTransactions({ transactions: formattedTransactions });
			// Optionally, you might want to sign the user out or navigate away after deletion
		} catch (_) {
			Alert.alert("Error", "There was an error deleting your account.");
		} finally {
			// Clear local storage of today's transactions
			await AsyncStorage.removeItem("todayTransactions");
			setCheckout(false);
		}
	};

	const className = cn("text-lg text-muted", !isLight && "-foreground");

	if (!user) return <Spinner className="flex-1 items-center justify-center" />;

	return (
		<Animated.View className="flex-1">
			<ScrollView
				contentInsetAdjustmentBehavior="always"
				contentContainerClassName="px-6 py-2 gap-4 min-h-full "
			>
				<Text className={cn("font-bold text-2xl", !isLight && "text-white")}>
					User Info Section
				</Text>
				<View className="flex">
					<Text className={className}>{user.name}</Text>
					<Text className={className}>{user.email}</Text>
					<Text className={className}>
						created {new Date(user._creationTime).toDateString()}
					</Text>
				</View>
				{/* Delete User*/}
				<View className="flex-row justify-between gap-4">
					<Button
						variant="tertiary"
						size="sm"
						className="self-start rounded-full"
						isDisabled={checkout}
						onPress={async () => {
							Alert.alert(
								"Checkout",
								"Are you sure you want to checkout for today?",
								[
									{
										text: "Cancel",
										style: "cancel",
									},
									{
										text: "Delete",
										onPress: async () => {
											await handleCheckout();
										},
									},
								],
							);
						}}
					>
						<Ionicons
							name="log-out-outline"
							size={18}
							color={themeColorForeground}
						/>
						<Button.Label>
							{checkout ? "Checking Out..." : "Checkout"}
						</Button.Label>
						{checkout ? <Spinner color={themeColorForeground} /> : null}
					</Button>
					{/* Sign Out */}
					<Button
						variant="tertiary"
						size="sm"
						className="self-start rounded-full"
						isDisabled={isSigningOut}
						onPress={async () => {
							setIsSigningOut(true);
							Alert.alert("Sign Out", "Are you sure you want to sign out?", [
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
							]);
							setIsSigningOut(false);
						}}
					>
						<Button.Label>
							{isSigningOut ? "Signing Out..." : "Sign Out"}
						</Button.Label>
						{isSigningOut ? <Spinner color={themeColorForeground} /> : null}
					</Button>
				</View>
			</ScrollView>
		</Animated.View>
	);
}
