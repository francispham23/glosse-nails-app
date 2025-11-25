import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useQuery } from "convex/react";
import { Button, cn, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { DataModel } from "@/convex/_generated/dataModel";

export default function HomeRoute() {
	const { isLight } = useAppTheme();
	const themeColorBackground = useThemeColor("background");
	const users = useQuery(api.users.users);

	const className = cn("font-bold text-lg", !isLight && "text-white");

	const totalCompensation =
		users?.reduce((sum, user) => sum + user.compensation, 0) || 0;
	const totalTips = users?.reduce((sum, user) => sum + user.tips, 0) || 0;

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
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-2 px-3 pb-24"
				keyExtractor={(item) => item._id.toString()}
				data={users}
				renderItem={({ item }) => <UserDetails user={item} />}
				itemLayoutAnimation={LinearTransition}
			/>
			<View className="absolute bottom-30 w-full flex-row justify-between border-t px-3 pt-3">
				<Text className={className}>
					Total: {totalCompensation + totalTips}
				</Text>
				<View className="flex-row justify-between gap-6">
					<Text className={className}>{totalCompensation}</Text>
					<Text className={className}>{totalTips}</Text>
				</View>
			</View>
			<Button
				onPress={() => {}}
				className="absolute bottom-10 self-center overflow-hidden rounded-full"
			>
				<Button.Label>Create Transaction</Button.Label>
				<Ionicons name="add-outline" size={18} color={themeColorBackground} />
			</Button>
		</View>
	);
}

type UserWithEarnings = {
	_id: DataModel["users"]["document"]["_id"];
	name?: string;
	_creationTime: number;
	compensation: number;
	tips: number;
};

const UserDetails = ({ user }: { user: UserWithEarnings }) => {
	const { isLight } = useAppTheme();

	const className = cn("text-lg text-muted", !isLight && "-foreground");

	if (!user) return null;

	return (
		<View className="flex-row justify-between gap-2">
			<Text className={className}>{user.name ?? "—"}</Text>
			<View className="flex-row justify-between gap-8">
				<Text className={className}>{user.compensation}</Text>
				<Text className={className}>{user.tips}</Text>
			</View>
		</View>
	);
};
