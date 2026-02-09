import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { type Report, ReportCard } from "@/components/report-card";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";

export default function ReportsRoute() {
	const { startOfDay, endOfDay } = useAppDate();

	const [startDate, setStartDate] = useState<Date>(startOfDay);
	const [endDate, setEndDate] = useState<Date>(endOfDay);
	const [openPicker, setOpenPicker] = useState<"start" | "end" | null>(null);

	// Query technicians with totals for the selected date range
	const technicians = useQuery(api.users.usersByDateRange, {
		startDate: startDate.setHours(0, 0, 0, 0),
		endDate: endDate.setHours(23, 59, 59, 999),
		report: true,
	});

	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate: startDate.setHours(0, 0, 0, 0),
		endDate: endDate.setHours(23, 59, 59, 999),
	});

	const giftCards = useQuery(api.giftCards.listByDateRange, {
		startDate: startDate.setHours(0, 0, 0, 0),
		endDate: endDate.setHours(23, 59, 59, 999),
	});

	const totalGiftCardBalance =
		giftCards?.reduce((sum, giftCard) => sum + giftCard.balance, 0) || 0;

	const totalCompensation =
		technicians?.reduce((sum, tech) => sum + tech.compensation, 0) ?? 0;
	const totalTip = technicians?.reduce((sum, tech) => sum + tech.tip, 0) ?? 0;
	const grandTotal = totalCompensation + totalTip;

	const totalDiscount =
		transactions?.reduce((sum, tx) => sum + (tx.discount || 0), 0) ?? 0;

	const totalSupply =
		transactions?.reduce((sum, tx) => sum + (tx.supply || 0), 0) ?? 0;

	const cashTransactions =
		transactions?.filter(
			(tx) =>
				!tx.compensationMethods?.includes("Card") &&
				tx.compensationMethods?.includes("Cash"),
		) || [];
	const totalCashCharges = cashTransactions.reduce(
		(sum, tx) => sum + (tx.compensation || 0),
		0,
	);
	const totalPartialCashCharges = transactions?.reduce(
		(sum, tx) => sum + (tx.compInCash || 0),
		0,
	);
	const totalCompCash =
		(totalCashCharges + (totalPartialCashCharges || 0)) * TAX;

	const tipCashTransactions =
		transactions?.filter(
			(tx) =>
				!tx.tipMethods?.includes("Card") && tx.tipMethods?.includes("Cash"),
		) || [];
	const totalTipCashOnly = tipCashTransactions.reduce(
		(sum, tx) => sum + (tx.tip || 0),
		0,
	);
	const totalPartialTipCash = transactions?.reduce(
		(sum, tx) => sum + (tx.tipInCash || 0),
		0,
	);
	const totalTipCash = totalTipCashOnly + (totalPartialTipCash || 0);
	const totalCash = totalCompCash + totalTipCash;

	const totalSupplyCash =
		transactions?.reduce((sum, tx) => {
			return sum + (tx.isCashSupply ? tx.supply || 0 : 0);
		}, 0) ?? 0;

	const totalDiscountCash =
		transactions?.reduce((sum, tx) => {
			return sum + (tx.isCashDiscount ? tx.discount || 0 : 0);
		}, 0) ?? 0;

	const totalRealCash =
		(totalCompCash || 0) +
		(totalSupplyCash || 0) * TAX -
		(totalDiscountCash || 0);

	// Build report cards data
	const reportCards: Report[] = [
		{
			id: "payroll",
			title: "Payroll",
			rows: [
				{
					label: "Total Compensation:",
					value: `$${totalCompensation.toFixed(2)}`,
				},
				{ label: "Total Tips:", value: `$${totalTip.toFixed(2)}` },
				{
					label: "Grand Total:",
					value: `$${grandTotal.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
		{
			id: "cash",
			title: "Cash",
			rows: [
				{
					label: "Total Compensation Cash:",
					value: `$${totalCompCash.toFixed(2)}`,
				},
				{ label: "Total Tip Cash:", value: `$${totalTipCash.toFixed(2)}` },
				{
					label: "Total Supply Cash:",
					value: `$${totalSupplyCash.toFixed(2)}`,
				},
				{
					label: "Total Discount Cash:",
					value: `$${totalDiscountCash.toFixed(2)}`,
				},
				{
					label: "Grand Total Cash:",
					value: `$${totalCash.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
				{
					label: "Grand Total Real Cash:",
					value: `$${totalRealCash.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
		{
			id: "gift",
			title: "Gift Cards",
			rows: [
				{
					label: "Total Balance Gift Cards:",
					value: `$${totalGiftCardBalance.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
		{
			id: "discount",
			title: "Discounts",
			rows: [
				{
					label: "Total Discount:",
					value: `$${totalDiscount.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
		{
			id: "supply",
			title: "Supply",
			rows: [
				{
					label: "Total Supply:",
					value: `$${totalSupply.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
	];

	return (
		<Animated.View
			className="flex-1 bg-background-secondary pt-4"
			entering={FadeIn}
			exiting={FadeOut}
		>
			{/* Date range selectors */}
			<View className="flex-row gap-2 px-6 pt-40 pb-4">
				<Button
					mode="outlined"
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						setOpenPicker(openPicker === "start" ? null : "start");
					}}
					icon={({ size, color }) => (
						<Ionicons name="calendar-outline" size={size} color={color} />
					)}
					className={openPicker === "start" ? "opacity-70" : ""}
				>
					{formatDate(startDate)}
				</Button>

				<Button
					mode="outlined"
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						setOpenPicker(openPicker === "end" ? null : "end");
					}}
					icon={({ size, color }) => (
						<Ionicons name="calendar-outline" size={size} color={color} />
					)}
					className={openPicker === "end" ? "opacity-70" : ""}
				>
					{formatDate(endDate)}
				</Button>
			</View>
			<View className={openPicker ? "h-56" : ""}>
				{/* Date pickers */}
				{openPicker === "start" && (
					<DateTimePicker
						value={startDate}
						mode="date"
						display="spinner"
						maximumDate={endDate}
						onChange={(_, selectedDate) => {
							setOpenPicker(null);
							if (selectedDate) {
								setStartDate(selectedDate);
							}
						}}
					/>
				)}
				{openPicker === "end" && (
					<DateTimePicker
						value={endDate}
						mode="date"
						display="spinner"
						minimumDate={startDate}
						maximumDate={endOfDay}
						onChange={(_, selectedDate) => {
							setOpenPicker(null);
							if (selectedDate) {
								setEndDate(selectedDate);
							}
						}}
					/>
				)}
			</View>

			{/* Report cards list */}
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-2 pt-2 px-4 pb-24"
				data={reportCards}
				renderItem={({ item }) => (
					<ReportCard item={item} startDate={startDate} endDate={endDate} />
				)}
				keyExtractor={(item) => item.id}
				scrollEnabled={true}
			/>
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

const TAX = 1.05;
