import { useQuery } from "convex/react";
import { cn } from "heroui-native";
import { Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";
import { ListEmptyComponent } from "@/components/list-empty";
import { TechnicianCard } from "@/components/technician-card";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { User } from "@/utils/types";

export default function HomeRoute() {
	const { isLight } = useAppTheme();

	const users = useQuery(api.users.users) || [];

	const className = cn(
		"min-w-[50] text-right font-bold text-lg",
		!isLight && "text-white",
	);

	return (
		<Animated.View className="flex-1 p-2" entering={FadeIn} exiting={FadeOut}>
			<View className="flex-row justify-between gap-2 px-5 pt-45 pb-4">
				<Text className={className}>Technician</Text>
				<View className="min-w-[50] flex-row justify-between gap-6">
					<Text className={className}>Compensation</Text>
					<Text className={className}>Tip</Text>
				</View>
			</View>
			{/* Technician List */}
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-2 px-5 pb-24"
				keyExtractor={(item) => item._id.toString()}
				data={users}
				renderItem={({ item }: { item: User }) => {
					return <TechnicianCard key={item._id} item={item} />;
				}}
				itemLayoutAnimation={LinearTransition}
				ListEmptyComponent={<ListEmptyComponent item="technician" />}
			/>
		</Animated.View>
	);
}
