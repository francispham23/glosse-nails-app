import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useQuery } from "convex/react";
import { Button, cn, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { DataModel } from "@/convex/_generated/dataModel";

export default function HomeRoute() {
	const { isLight } = useAppTheme();
	const themeColorBackground = useThemeColor("background");
	const users = useQuery(api.users.users);

	const className = cn("font-bold text-lg", !isLight && "text-white");

	return (
		<View className="flex-1">
			<View className="flex-row justify-between gap-2 px-3 pt-45 pb-4">
				<Text className={className}>Technician</Text>
				<View className="flex-row justify-between gap-6">
					<Text className={className}>Compensation</Text>
					<Text className={className}>Tips</Text>
				</View>
			</View>
			{/* Users List */}
			<FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-2 px-3 pb-24"
				keyExtractor={(item) => item._id.toString()}
				data={users}
				renderItem={({ item }) => <UserDetails user={item} />}
			/>
			<View className="absolute bottom-60 w-full flex-row justify-between px-3">
				<Text className={className}>Total: 6,200</Text>
				<View className="flex-row justify-between gap-6">
					<Text className={className}>6000</Text>
					<Text className={className}>200</Text>
				</View>
			</View>
			<Button
				onPress={() => {}}
				className="absolute bottom-30 self-center overflow-hidden rounded-full"
			>
				<Button.Label>Create Transaction</Button.Label>
				<Ionicons name="add-outline" size={18} color={themeColorBackground} />
			</Button>
		</View>
	);
}

const UserDetails = ({ user }: { user: DataModel["users"]["document"] }) => {
	const { isLight } = useAppTheme();

	const className = cn("text-lg text-muted", !isLight && "-foreground");

	if (!user) return null;

	return (
		<View className="flex-row justify-between gap-2">
			<Text className={className}>{user.name}</Text>
			<View className="flex-row justify-between gap-8">
				<Text className={className}>3,000</Text>
				<Text className={className}>100</Text>
			</View>
		</View>
	);
};
