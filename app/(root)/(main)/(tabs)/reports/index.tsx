import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { cn } from "heroui-native";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { api } from "@/convex/_generated/api";

type ReportCardType = "payroll" | "discount" | "cash" | "gift" | "supply";

interface ReportCard {
	id: ReportCardType;
	title: string;
	rows: Array<{
		label: string;
		value: string;
		isBold?: boolean;
		isLarge?: boolean;
	}>;
}

export default function ReportsRoute() {
	const router = useRouter();

	const today = new Date();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

	const [startDate, setStartDate] = useState<Date>(firstDayOfMonth);
	const [endDate, setEndDate] = useState<Date>(today);
	const [openPicker, setOpenPicker] = useState<"start" | "end" | null>(null);

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

	const giftCards = useQuery(api.giftCards.listByDateRange, {
		startDate: startDate.getTime(),
		endDate: endDate.getTime(),
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
	const totalCompCash = totalCashCharges + (totalPartialCashCharges || 0);

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

	const totalSupplyCash = transactions?.reduce((sum, tx) => {
		// Only include supply paid in cash
		const isCashSupply =
			tx.compensationMethods?.includes("Cash") &&
			!tx.compensationMethods?.includes("Card");
		return sum + (isCashSupply ? tx.supply || 0 : 0);
	}, 0);

	const totalRealCash = ((totalCompCash || 0) + (totalSupplyCash || 0)) * 1.05;

	const classname = cn("font-semibold text-foreground");

	// Build report cards data
	const reportCards: ReportCard[] = [
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

	const onPress = (type: ReportCardType) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.navigate({
			pathname: `/report/${type}`,
			params: {
				startDate: startDate.getTime().toString(),
				endDate: endDate.getTime().toString(),
			},
		});
	};

	const renderReportCard = ({ item }: { item: ReportCard }) => (
		<Pressable onPress={() => onPress(item.id)}>
			<View className="rounded-lg bg-background p-4">
				{item.rows.map((row, index) => (
					<View
						key={row.label}
						className={cn(
							"flex-row justify-between",
							index < item.rows.length - 1
								? "border-border border-b pb-2"
								: "pt-2",
							index > 0 && index < item.rows.length - 1 && "py-2",
						)}
					>
						<Text className="text-foreground">{row.label}</Text>
						<Text
							className={cn(
								row.isBold && "font-bold",
								row.isLarge && "text-lg",
								!row.isBold && classname,
							)}
						>
							{row.value}
						</Text>
					</View>
				))}
			</View>
		</Pressable>
	);

	return (
		<Animated.View
			className="flex-1 bg-background-secondary pt-4"
			entering={FadeIn}
			exiting={FadeOut}
		>
			{/* Date range selectors */}
			<View className="flex-row gap-2 px-6 pt-40 pb-4">
				<Pressable
					className={openPicker === "start" ? "opacity-70" : ""}
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						setOpenPicker(openPicker === "start" ? null : "start");
					}}
				>
					<View className="rounded-lg bg-background px-4 py-2">
						<Text className="text-foreground">{formatDate(startDate)}</Text>
					</View>
				</Pressable>

				<Pressable
					className={openPicker === "end" ? "opacity-70" : ""}
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						setOpenPicker(openPicker === "end" ? null : "end");
					}}
				>
					<View className="rounded-lg bg-background px-4 py-2">
						<Text className="text-foreground">{formatDate(endDate)}</Text>
					</View>
				</Pressable>
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
						maximumDate={new Date()}
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
			<FlatList
				data={reportCards}
				renderItem={renderReportCard}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{
					gap: 16,
					paddingHorizontal: 24,
					paddingBottom: 16,
				}}
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
