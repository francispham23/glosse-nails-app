import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { api } from "@/convex/_generated/api";

export default function DiscountRoute() {
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
					(!tx.compensationMethods?.includes("card") &&
						(tx.compensationMethods?.includes("cash") ||
							(tx.compInCash && tx.compInCash > 0))) ||
					(!tx.tipMethods?.includes("card") &&
						tx.tipMethods?.includes("cash")) ||
					(tx.tipInCash && tx.tipInCash > 0),
			)
			.map((tx) => ({
				...tx,
				cash: (tx.compInCash || 0) + (tx.tipInCash || 0),
			})) || [];

	const classname = cn("font-semibold text-foreground");

	return (
		<Animated.View
			className="flex-1 gap-2 px-6 pt-18"
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text className="font-extrabold text-3xl text-foreground">
				Discount Report
			</Text>
			<View className="flex-1 pt-6">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={classname}>Date</Text>
					<Text className={classname}>Technician</Text>
					<Text className={cn(classname, "text-right")}>Discount</Text>
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
		cash: number;
	};
};

const CashCard = ({ item }: Props) => {
	const classname = cn("text-md text-muted", !true && "-foreground");

	return (
		<View className="flex-row items-center gap-4 rounded-lg border-r-accent bg-background-secondary p-2">
			<Text className={cn(classname, "min-w-[105]")}>
				{item.serviceDate
					? new Date(item.serviceDate).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})
					: "N/A"}
			</Text>
			<Text className={cn(classname, "flex-1 text-left")}>
				{item.technician || "Unknown"}
			</Text>
			<Text className={cn(classname, "min-w-[40] text-right")}>
				${item.cash.toFixed(2)}
			</Text>
		</View>
	);
};
