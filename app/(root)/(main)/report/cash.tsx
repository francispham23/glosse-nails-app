import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { cn } from "@/utils";

export default function DiscountRoute() {
	const { isLight } = useAppTheme();
	const params = useLocalSearchParams();
	const startDate = params.startDate ? Number(params.startDate) : Date.now();
	const endDate = params.endDate ? Number(params.endDate) : Date.now();
	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate,
		endDate,
	});

	const cashTransactions =
		transactions
			?.filter(
				(tx) =>
					(tx.compInCash && tx.compInCash > 0) ||
					(tx.tipInCash && tx.tipInCash > 0) ||
					(!tx.compensationMethods?.includes("Card") &&
						tx.compensationMethods?.includes("Cash")) ||
					(!tx.tipMethods?.includes("Card") && tx.tipMethods?.includes("Cash")),
			)
			.map((tx) => ({
				...tx,
				tip:
					tx.tipInCash ||
					0 +
						(tx.tipMethods?.includes("Cash") && !tx.tipMethods?.includes("Card")
							? tx.tip || 0
							: 0),
				compensation:
					(tx.compInCash || 0) +
					(tx.compensationMethods?.includes("Cash") &&
					!tx.compensationMethods?.includes("Card")
						? tx.compensation || 0
						: 0),
				realCash:
					((tx.compInCash || 0) +
						(tx.compensationMethods?.includes("Cash") &&
						!tx.compensationMethods?.includes("Card")
							? tx.compensation || 0
							: 0)) *
					1.05,
			})) || [];

	const classname = cn(
		"font-semibold text-foreground",
		!isLight && "text-gray-300",
	);

	return (
		<Animated.View
			className="flex-1 gap-2 px-6 pt-18"
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text
				className={cn(
					"font-extrabold text-3xl text-foreground",
					!isLight && "text-gray-300",
				)}
			>
				Cash Report
			</Text>
			<View className="flex-1 pt-6">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={cn(classname, "max-w-[60]")}>Date</Text>
					<Text className={cn(classname, "text-right")}>Technician</Text>
					<Text className={cn(classname, "text-right")}>Tip</Text>
					<Text className={cn(classname, "text-right")}>Compensation</Text>
					<Text className={cn(classname, "text-right")}>Real Cash</Text>
				</View>

				<FlatList
					data={cashTransactions}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => <CashCard item={item} />}
					contentContainerClassName="gap-2"
					ListEmptyComponent={<ListEmptyComponent item="cash" />}
				/>
			</View>
		</Animated.View>
	);
}

type Props = {
	item: {
		_id: string;
		serviceDate: number | undefined;
		technician: string | undefined;
		tip: number;
		compensation: number;
		realCash: number;
	};
};

const CashCard = ({ item }: Props) => {
	const { isLight } = useAppTheme();
	const classname = cn("text-muted text-sm", !isLight && "text-gray-300");

	return (
		<View className="flex-row items-center rounded-lg border-r-accent bg-gray-300 p-2 shadow-md dark:bg-gray-700">
			<Text className={cn(classname, "min-w-[50]")}>
				{item.serviceDate
					? new Date(item.serviceDate).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						})
					: "N/A"}
			</Text>
			<Text className={cn(classname, "min-w-[40] flex-1 text-left")}>
				{item.technician?.split(" ")[0] || "Unknown"}
			</Text>
			<Text className={cn(classname, "min-w-[60] text-right")}>
				${item.tip.toFixed(2)}
			</Text>
			<Text className={cn(classname, "min-w-[90] text-right")}>
				${item.compensation.toFixed(2)}
			</Text>
			<Text className={cn(classname, "min-w-[80] text-right")}>
				${item.realCash.toFixed(2)}
			</Text>
		</View>
	);
};
