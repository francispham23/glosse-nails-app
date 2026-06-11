import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

import { AddButton } from "@/components/Buttons/add-button";
import { TechnicianCard } from "@/components/Cards/technician-card";
import { ListEmptyComponent } from "@/components/list-empty";
import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { useAuthorization } from "@/hooks/use-authorization";
import { cn, getErrorMessage, isToday, type User } from "@/utils";

const EMPTY_COMPONENT = <ListEmptyComponent item="technician" />;

export default function HomeRoute() {
	const { isLight } = useAppTheme();
	const { startOfDay, endOfDay } = useAppDate();
	const { isAuthorized: isAuthUser, user } = useAuthorization();

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
		if (onShiftTechs === null) return setSelectedTechnicians([]);
		// Filter technicians based on onShiftTechs
		if (onShiftTechs && technicians) {
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

	const isEndDateToday = useMemo(() => isToday(endOfDay.getTime()), [endOfDay]);

	const renderItem = useCallback(
		({ item }: { item: User }) => {
			const isSelected = selectedTechnicians.some((u) => u._id === item._id);
			return (
				<TechnicianCard
					key={item._id}
					item={item}
					isSelecting={isSelecting}
					isSelected={isSelected}
					isAuthorized={
						isAuthUser || (user?._id === item._id && isEndDateToday)
					}
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
		},
		[selectedTechnicians, isSelecting, isAuthUser, user?._id, isEndDateToday],
	);

	const filteredSelectedTechnicians = useMemo(
		() =>
			selectedTechnicians.filter((tech) =>
				(!isAuthUser && isEndDateToday) || isAuthUser
					? true
					: tech._id === user?._id,
			),
		[selectedTechnicians, isAuthUser, isEndDateToday, user?._id],
	);

	const data = useMemo(
		() => (isSelecting ? technicians : filteredSelectedTechnicians),
		[isSelecting, technicians, filteredSelectedTechnicians],
	);

	const className = useMemo(
		() =>
			cn(
				"min-w-[50] text-right font-bold text-lg",
				!isLight && "text-gray-300",
			),
		[isLight],
	);

	const keyExtractor = useCallback((item: User) => item._id.toString(), []);

	const handleSetIsAdding = useCallback(
		async (adding: boolean) => {
			if (isSelecting && !adding && selectedTechnicians.length > 0) {
				try {
					await saveShift({
						technicians: selectedTechnicians.map((u) => u._id),
						shiftDate: startOfDay.getTime(),
					});
				} catch (error) {
					Alert.alert("Error", getErrorMessage(error, "Failed to save shift"));
					console.error("Failed to save shift:", error);
				}
			}
			setIsSelecting(adding);
		},
		[isSelecting, selectedTechnicians, saveShift, startOfDay],
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
				keyExtractor={keyExtractor}
				data={data}
				renderItem={renderItem}
				itemLayoutAnimation={LinearTransition}
				ListEmptyComponent={EMPTY_COMPONENT}
			/>
			{isAuthUser ? (
				<View className="absolute bottom-25 self-center">
					<AddButton isAdding={isSelecting} setIsAdding={handleSetIsAdding} />
				</View>
			) : null}
		</Animated.View>
	);
}
