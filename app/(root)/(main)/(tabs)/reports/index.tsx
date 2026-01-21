import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { cn } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { api } from "@/convex/_generated/api";

export default function ReportsRoute() {
	const router = useRouter();

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

	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate: startDate.getTime(),
		endDate: endDate.getTime(),
	});

	const totalCompensation =
		technicians?.reduce((sum, tech) => sum + tech.compensation, 0) ?? 0;
	const totalTip = technicians?.reduce((sum, tech) => sum + tech.tip, 0) ?? 0;
	const grandTotal = totalCompensation + totalTip;

	const totalDiscount =
		transactions?.reduce((sum, tx) => sum + (tx.discount || 0), 0) ?? 0;

	const classname = cn("font-semibold text-foreground");

	const onPress = (type: "payroll" | "discount") => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.navigate({
			pathname: `/report/${type}`,
			params: {
				startDate: startDate.getTime().toString(),
				endDate: endDate.getTime().toString(),
			},
		});
	};

	return (
		<Animated.View
			className="flex-1 gap-4 bg-background-secondary px-6 pt-40 pb-4"
			entering={FadeIn}
			exiting={FadeOut}
		>
			{/* Date range selectors */}
			<View className="flex-row gap-2 pt-5">
				<Pressable
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						setShowStartPicker(!showStartPicker);
					}}
				>
					<View className="rounded-lg bg-background px-4 py-2">
						<Text className="text-foreground">{formatDate(startDate)}</Text>
					</View>
				</Pressable>

				<Pressable
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						setShowEndPicker(!showEndPicker);
					}}
				>
					<View className="rounded-lg bg-background px-4 py-2">
						<Text className="text-foreground">{formatDate(endDate)}</Text>
					</View>
				</Pressable>
			</View>
			{/* Date pickers */}
			<View>
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

			{/* Payroll totals */}
			<Pressable onPress={() => onPress("payroll")}>
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
			</Pressable>

			{/* Discount totals */}
			<Pressable onPress={() => onPress("discount")}>
				<View className="rounded-lg bg-background p-4">
					<View className="flex-row justify-between border-border border-b pb-2">
						<Text className={classname}>Total Discount:</Text>
						<Text className="font-bold text-foreground text-lg">
							${totalDiscount.toFixed(2)}
						</Text>
					</View>
				</View>
			</Pressable>
		</Animated.View>
	);
}

const formatDate = (date: Date) => {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};
