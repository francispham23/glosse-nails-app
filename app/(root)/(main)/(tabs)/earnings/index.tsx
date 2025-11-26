import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useQuery } from "convex/react";
import { Button, cn, useThemeColor } from "heroui-native";
import { Text } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { User } from "@/utils/types";

export default function HomeRoute() {
	const { isLight } = useAppTheme();
	const themeColorBackground = useThemeColor("background");
	const users = useQuery(api.users.users);

	const renderItem = ({ item }: { item: User }) => {
		const className = cn(
			"min-w-[50] text-right text-lg text-muted",
			!isLight && "-foreground",
		);

		return (
			<Animated.View
				key={item._id}
				entering={FadeIn}
				exiting={FadeOut}
				className="flex-row justify-between gap-2"
			>
				<Text className={className}>{item.name ?? "Unknown"}</Text>
				<Animated.View className="flex-row justify-between gap-6">
					<Text className={className}>${item.compensation}</Text>
					<Text className={className}>${item.tip}</Text>
				</Animated.View>
			</Animated.View>
		);
	};

	const className = cn(
		"min-w-[50] text-right font-bold text-lg",
		!isLight && "text-white",
	);

	const totalCompensation =
		users?.reduce((sum, user) => sum + user.compensation, 0) || 0;
	const totalTip = users?.reduce((sum, user) => sum + user.tip, 0) || 0;

	return (
		<Animated.View className="flex-1">
			<Animated.View className="flex-row justify-between gap-2 px-5 pt-45 pb-4">
				<Text className={className}>Technician</Text>
				<Animated.View className="min-w-[50] flex-row justify-between gap-6">
					<Text className={className}>Compensation</Text>
					<Text className={className}>Tip</Text>
				</Animated.View>
			</Animated.View>
			{/* Users List */}
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-2 px-5 pb-24"
				keyExtractor={(item) => item._id.toString()}
				data={users}
				renderItem={renderItem}
				itemLayoutAnimation={LinearTransition}
			/>
			<Animated.View className="absolute bottom-50 w-full flex-row justify-between border-t px-5 pt-3">
				<Text className={className}>
					Total: ${totalCompensation + totalTip}
				</Text>
				<Animated.View className="min-w-[50] flex-row justify-between gap-6">
					<Text className={className}>${totalCompensation}</Text>
					<Text className={className}>${totalTip}</Text>
				</Animated.View>
			</Animated.View>
			<Button
				onPress={() => {}}
				className="absolute bottom-30 self-center overflow-hidden rounded-full"
			>
				<Button.Label>Create Transaction</Button.Label>
				<Ionicons name="add-outline" size={18} color={themeColorBackground} />
			</Button>
		</Animated.View>
	);
}
