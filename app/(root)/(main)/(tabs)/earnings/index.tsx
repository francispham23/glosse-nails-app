import { useQuery } from "convex/react";
import { useFocusEffect } from "expo-router";
import { cn } from "heroui-native";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { TechnicianCard } from "@/components/technician-card";
import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { isToday } from "@/utils/index";
import { getUsersFromTodayTransactions } from "@/utils/transaction-storage";
import type { User } from "@/utils/types";

export default function HomeRoute() {
	const { isLight } = useAppTheme();
	const { startOfDay, endOfDay, date } = useAppDate();
	// Query Convex only when not showing today's data
	const convexUsers = useQuery(api.users.usersByDateRange, {
		startDate: startOfDay.getTime(),
		endDate: endOfDay.getTime(),
	});
	const [users, setUsers] = useState<User[]>([]);

	// Check if the selected date is today
	const isSelectedDateToday = isToday(date.getTime());

	// Load users - prefer Convex data, fall back to local storage only when needed
	useFocusEffect(
		useCallback(() => {
			// Always prefer Convex data when available
			if (convexUsers && convexUsers.length > 0) {
				setUsers(convexUsers);
				return;
			}

			// Only load from local storage if it's today and no Convex data available
			if (isSelectedDateToday) {
				const loadLocalUsers = async () => {
					const localUsers = await getUsersFromTodayTransactions();
					setUsers(localUsers as User[]);
				};
				loadLocalUsers();
			} else {
				// No Convex data and not today, set empty array
				setUsers([]);
			}
		}, [isSelectedDateToday, convexUsers]),
	);

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
