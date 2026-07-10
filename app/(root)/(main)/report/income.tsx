import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { cn, formatDate, type Transaction } from "@/utils";

export default function IncomeRoute() {
	const { isLight } = useAppTheme();
	const params = useLocalSearchParams();
	const startDate = params.startDate ? Number(params.startDate) : Date.now();
	const endDate = params.endDate ? Number(params.endDate) : Date.now();
	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate,
		endDate,
		report: true,
	});

	const incomeByDate = (transactions: Transaction[]) => {
		const incomeMap: { [key: string]: number } = {};
		transactions.forEach((tx) => {
			if (tx.serviceDate !== undefined) {
				const date = formatDate(tx.serviceDate);
				if (!incomeMap[date]) {
					incomeMap[date] = 0;
				}
				incomeMap[date] += tx.compensation || 0;
			}
		});
		return Object.entries(incomeMap).map(([date, total]) => ({ date, total }));
	};

	const classname = cn(
		"font-semibold text-foreground",
		!isLight && "text-gray-300",
	);

	if (!transactions) {
		return <ActivityIndicator className="flex-1 items-center justify-center" />;
	}

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
				Income Report
			</Text>
			<View className="flex-1 pt-6">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={classname}>Date</Text>
					<Text className={cn(classname, "text-right")}>Total Income</Text>
				</View>

				<FlatList
					data={incomeByDate(transactions)}
					keyExtractor={(item) => item.date}
					renderItem={({ item }) => <IncomeCard item={item} />}
					contentContainerClassName="gap-2"
					ListEmptyComponent={<ListEmptyComponent item="income" />}
				/>
			</View>
		</Animated.View>
	);
}

const IncomeCard = ({ item }: { item: { date: string; total: number } }) => {
	const { isLight } = useAppTheme();
	const classname = cn("text-md text-muted", !isLight && "text-gray-300");

	return (
		<View className="rounded-lg bg-gray-300 p-4 shadow-md dark:bg-gray-700">
			<View className="flex-row justify-between">
				<Text className={cn(classname, "min-w-[105]")}>{item.date}</Text>
				<Text className={cn(classname, "min-w-[40] text-right")}>
					${item.total.toFixed(2)}
				</Text>
			</View>
		</View>
	);
};
