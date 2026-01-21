import { useMutation, useQuery } from "convex/react";
import { useFocusEffect } from "expo-router";
import { cn } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

import { AddButton } from "@/components/Buttons/add-button";
import { ListEmptyComponent } from "@/components/list-empty";
import { TechnicianCard } from "@/components/technician-card";
import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { isToday } from "@/utils/index";
import { getUsersFromTodayTransactions } from "@/utils/transaction-storage";
import type { User } from "@/utils/types";

export default function HomeRoute() {
	const { isLight } = useAppTheme();
	const isOffline = useNetworkStatus();
	const { startOfDay, endOfDay, date } = useAppDate();

	// Query Convex only when not showing today's data
	const convexUsers = useQuery(api.users.usersByDateRange, {
		startDate: startOfDay.getTime(),
		endDate: endOfDay.getTime(),
	});

	// Query shift for the selected date
	const onShiftTechs = useQuery(api.shifts.getShiftByDate, {
		shiftDate: startOfDay.getTime(),
	});

	// Mutation to save shift
	const saveShift = useMutation(api.shifts.saveShift);

	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const [isSelecting, setIsSelecting] = useState(false);

	// Check if the selected date is today
	const isSelectedDateToday = isToday(date.getTime());

	// Load users - prefer Convex data, fall back to local storage only when offline
	useFocusEffect(
		useCallback(() => {
			// Only load from local storage if Convex data is unavailable (offline) and it's today
			if (isSelectedDateToday && isOffline) {
				const loadLocalUsers = async () => {
					const storedUsers = await getUsersFromTodayTransactions();
					setSelectedUsers(storedUsers as User[]);
				};
				loadLocalUsers();
			}
		}, [isSelectedDateToday, isOffline]),
	);

	useEffect(() => {
		// Filter convexUsers based on onShiftTechs
		if (onShiftTechs && onShiftTechs.length > 0 && convexUsers) {
			const shiftUserIds = new Set(onShiftTechs.map((user) => user._id));
			const filteredUsers = convexUsers.filter((user) =>
				shiftUserIds.has(user._id),
			);
			setSelectedUsers(filteredUsers);
		} else if (!isSelecting && convexUsers) {
			// Update selected users when Convex data changes and not selecting
			setSelectedUsers((prev) =>
				prev.map((u) => {
					// Update selected users info with new Convex data
					const updated = convexUsers.find((cu) => cu._id === u._id);
					return updated || u;
				}),
			);
		}
	}, [convexUsers, isSelecting, onShiftTechs]);

	const className = cn(
		"min-w-[50] text-right font-bold text-lg",
		!isLight && "text-white",
	);

	return (
		<Animated.View className="flex-1 p-2" entering={FadeIn} exiting={FadeOut}>
			<View className="flex-row justify-between gap-2 px-5 pt-45 pb-4">
				<Text className={className}>Technician</Text>
				<View className="min-w-[50] flex-row justify-between gap-6">
					<Text className={className}>Earning</Text>
					<Text className={cn("w-[50]", className)}>Tip</Text>
				</View>
			</View>
			{/* Technician List */}
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-2 px-4 pb-24"
				keyExtractor={(item) => item._id.toString()}
				data={isSelecting ? convexUsers : selectedUsers}
				renderItem={({ item }: { item: User }) => {
					const isSelected = selectedUsers.some((u) => u._id === item._id);
					return (
						<TechnicianCard
							key={item._id}
							item={item}
							isSelecting={isSelecting}
							isSelected={isSelected}
							onToggleSelect={(user) => {
								if (isSelected) {
									setSelectedUsers((prev) =>
										prev.filter((u) => u._id !== user._id),
									);
								} else {
									setSelectedUsers((prev) => [...prev, user]);
								}
							}}
						/>
					);
				}}
				itemLayoutAnimation={LinearTransition}
				ListEmptyComponent={<ListEmptyComponent item="technician" />}
			/>
			<View className="absolute bottom-30 self-center">
				<AddButton
					isAdding={isSelecting}
					setIsAdding={async (adding) => {
						// When exiting selection mode, save the shift
						if (isSelecting && !adding && selectedUsers.length > 0) {
							try {
								await saveShift({
									technicians: selectedUsers.map((u) => u._id),
									shiftDate: startOfDay.getTime(),
								});
							} catch (error) {
								console.error("Failed to save shift:", error);
							}
						}
						setIsSelecting(adding);
					}}
				/>
			</View>
		</Animated.View>
	);
}
