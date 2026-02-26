import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
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
import { cn } from "@/utils";
import type { User } from "@/utils/types";

export default function HomeRoute() {
	const { isLight } = useAppTheme();
	const { startOfDay, endOfDay } = useAppDate();

	// Query Convex only when not showing today's data
	const technicians = useQuery(api.users.usersByDateRange, {
		startDate: startOfDay.getTime(),
		endDate: endOfDay.getTime(),
	});

	// Query shift for the selected date
	const onShiftTechs = useQuery(api.shifts.getShiftByDate, {
		shiftDate: startOfDay.getTime(),
	});

	// Mutation to save shift
	const saveShift = useMutation(api.shifts.saveShift);

	const [selectedTechnicians, setSelectedTechnicians] = useState<User[]>([]);
	const [isSelecting, setIsSelecting] = useState(false);

	useEffect(() => {
		// Filter technicians based on onShiftTechs
		if (onShiftTechs && onShiftTechs.length > 0 && technicians) {
			const shiftUserIds = new Set(onShiftTechs.map((user) => user._id));
			const filteredUsers = technicians.filter((user) =>
				shiftUserIds.has(user._id),
			);
			setSelectedTechnicians(filteredUsers);
		} else if (!isSelecting && technicians) {
			// Update selected users when Convex data changes and not selecting
			setSelectedTechnicians((prev) =>
				prev.map((u) => {
					// Update selected users info with new Convex data
					const updated = technicians.find((cu) => cu._id === u._id);
					return updated || u;
				}),
			);
		}
	}, [technicians, isSelecting, onShiftTechs]);

	const className = cn(
		"min-w-[50] text-right font-bold text-lg",
		!isLight && "text-gray-300",
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
				contentContainerClassName="gap-4 p-2 pb-24"
				keyExtractor={(item) => item._id.toString()}
				data={isSelecting ? technicians : selectedTechnicians}
				renderItem={({ item }: { item: User }) => {
					const isSelected = selectedTechnicians.some(
						(u) => u._id === item._id,
					);
					return (
						<TechnicianCard
							key={item._id}
							item={item}
							isSelecting={isSelecting}
							isSelected={isSelected}
							onToggleSelect={(user) => {
								if (isSelected) {
									setSelectedTechnicians((prev) =>
										prev.filter((u) => u._id !== user._id),
									);
								} else {
									setSelectedTechnicians((prev) => [...prev, user]);
								}
							}}
						/>
					);
				}}
				itemLayoutAnimation={LinearTransition}
				ListEmptyComponent={<ListEmptyComponent item="technician" />}
			/>
			<View className="absolute bottom-25 self-center">
				<AddButton
					isAdding={isSelecting}
					setIsAdding={async (adding) => {
						// When exiting selection mode, save the shift
						if (isSelecting && !adding && selectedTechnicians.length > 0) {
							try {
								await saveShift({
									technicians: selectedTechnicians.map((u) => u._id),
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
