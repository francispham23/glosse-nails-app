import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "convex/react";
import { cn } from "heroui-native";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { TechnicianCard } from "@/components/technician-card";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";

export default function ReportRoute() {
	const { isLight } = useAppTheme();
	const today = new Date();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

	const [startDate, setStartDate] = useState<Date>(firstDayOfMonth);
	const [endDate, setEndDate] = useState<Date>(today);
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);

	// Query technicians with totals for the selected date range
	const technicians = useQuery(api.users.usersByDateRange, {
		startDate: startDate.getTime(),
		endDate: endDate.getTime(),
		report: true,
	});

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const totalCompensation =
		technicians?.reduce((sum, tech) => sum + tech.compensation, 0) ?? 0;
	const totalTip = technicians?.reduce((sum, tech) => sum + tech.tip, 0) ?? 0;
	const grandTotal = totalCompensation + totalTip;

	const classname = cn("font-semibold text-foreground");
	const textClassName = cn(
		"w-20 text-base text-foreground",
		!isLight && "-foreground",
	);

	return (
		<Animated.View className="flex-1" entering={FadeIn} exiting={FadeOut}>
			{/* Header with date range selection */}
			<View className="gap-4 bg-background-secondary px-6 pt-40 pb-4">
				{/* Date range selectors */}
				<View className="mr-30 gap-2 pt-5">
					<View className="flex-row items-center gap-3">
						<Text className={textClassName}>Start Date:</Text>
						<TouchableOpacity
							onPress={() => setShowStartPicker(!showStartPicker)}
							className="flex-1 rounded-lg border border-border bg-background px-4 py-3"
						>
							<Text className="text-foreground">{formatDate(startDate)}</Text>
						</TouchableOpacity>
					</View>
					{showStartPicker && (
						<DateTimePicker
							value={startDate}
							mode="date"
							display="spinner"
							maximumDate={endDate}
							onChange={(_, selectedDate) => {
								setShowStartPicker(false);
								if (selectedDate) {
									setStartDate(selectedDate);
								}
							}}
						/>
					)}

					<View className="flex-row items-center gap-3">
						<Text className={textClassName}>End Date:</Text>
						<TouchableOpacity
							onPress={() => setShowEndPicker(!showEndPicker)}
							className="flex-1 rounded-lg border border-border bg-background px-4 py-3"
						>
							<Text className="text-foreground">{formatDate(endDate)}</Text>
						</TouchableOpacity>
					</View>
					{showEndPicker && (
						<DateTimePicker
							value={endDate}
							mode="date"
							display="spinner"
							minimumDate={startDate}
							maximumDate={new Date()}
							onChange={(_, selectedDate) => {
								setShowEndPicker(false);
								if (selectedDate) {
									setEndDate(selectedDate);
								}
							}}
						/>
					)}
				</View>

				{/* Summary totals */}
				<View className="rounded-lg bg-background p-4">
					<View className="flex-row justify-between border-border border-b pb-2">
						<Text className="text-foreground">Total Compensation:</Text>
						<Text className={classname}>${totalCompensation.toFixed(2)}</Text>
					</View>
					<View className="flex-row justify-between border-border border-b py-2">
						<Text className="text-foreground">Total Tips:</Text>
						<Text className={classname}>${totalTip.toFixed(2)}</Text>
					</View>
					<View className="flex-row justify-between pt-2">
						<Text className={classname}>Grand Total:</Text>
						<Text className="font-bold text-foreground text-lg">
							${grandTotal.toFixed(2)}
						</Text>
					</View>
				</View>
			</View>

			{/* Technicians list */}
			<View className="mb-25 flex-1 px-6 pt-4">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={classname}>Technician</Text>
					<Text className={cn(classname, "text-right")}>Comp</Text>
					<Text className={cn(classname, "text-right")}>Tips</Text>
					<Text className={cn(classname, "text-right")}>Total</Text>
				</View>

				<FlatList
					data={technicians}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => <TechnicianCard item={item} report />}
					contentContainerClassName="gap-2"
					ListEmptyComponent={<ListEmptyComponent item="technician" />}
				/>
			</View>
		</Animated.View>
	);
}
