import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ListEmptyComponent } from "@/components/list-empty";
import { api } from "@/convex/_generated/api";
import { cn } from "@/utils";

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
					(tx.compInCash && tx.compInCash > 0) ||
					(tx.tipInCash && tx.tipInCash > 0) ||
					(!tx.compensationMethods?.includes("Card") &&
						tx.compensationMethods?.includes("Cash")) ||
					(!tx.tipMethods?.includes("Card") && tx.tipMethods?.includes("Cash")),
			)
			.map((tx) => ({
				...tx,
				cash:
					(tx.compInCash || 0) +
					(tx.tipInCash || 0) +
					(tx.compensationMethods?.includes("Cash") &&
					!tx.compensationMethods?.includes("Card")
						? tx.compensation ||
							0 ||
							(tx.tipMethods?.includes("Cash") &&
							!tx.tipMethods?.includes("Card")
								? tx.tip || 0
								: 0)
						: 0),
				realCash:
					(tx.compInCash || 0) +
					(tx.compensationMethods?.includes("Cash") &&
					!tx.compensationMethods?.includes("Card")
						? (tx.compensation || 0) + (tx.supply || 0)
						: 0) *
						1.05,
			})) || [];

	const classname = cn("font-semibold text-foreground");

	return (
		<Animated.View
			className="flex-1 gap-2 px-6 pt-18"
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text className="font-extrabold text-3xl text-foreground">
				Cash Report
			</Text>
			<View className="flex-1 pt-6">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={cn(classname, "min-w-[60]")}>Date</Text>
					<Text className={cn(classname, "text-right")}>Technician</Text>
					<Text className={cn(classname, "text-right")}>Cash</Text>
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
		cash: number;
		realCash: number;
	};
};

const CashCard = ({ item }: Props) => {
	const classname = cn("text-md text-muted", !true && "-foreground");

	return (
		<View className="flex-row items-center gap-4 rounded-lg border-r-accent bg-gray-300 p-2 shadow-md dark:bg-gray-700">
			<Text className={cn(classname, "min-w-[105]")}>
				{item.serviceDate
					? new Date(item.serviceDate).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						})
					: "N/A"}
			</Text>
			<Text className={cn(classname, "min-w-[55] flex-1 text-left")}>
				{item.technician || "Unknown"}
			</Text>
			<Text className={cn(classname, "min-w-[55] text-right")}>
				${item.cash.toFixed(2)}
			</Text>
			<Text className={cn(classname, "min-w-[75] text-right")}>
				${item.realCash.toFixed(2)}
			</Text>
		</View>
	);
};
