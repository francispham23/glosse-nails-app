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

	const discount =
		transactions
			?.filter(
				(tx) =>
					tx.discount && tx.discount > 0 && tx.serviceDate && tx.technician,
			)
			.map((tx) => {
				return {
					_id: tx._id,
					serviceDate: tx.serviceDate as number,
					technician: tx.technician as string,
					discount: tx.discount || 0,
				};
			}) || [];

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
					data={discount}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => <DiscountCard item={item} />}
					contentContainerClassName="gap-2"
					ListEmptyComponent={<ListEmptyComponent item="discount" />}
				/>
			</View>
		</Animated.View>
	);
}

type Props = {
	item: {
		_id: string;
		serviceDate: number;
		technician: string;
		discount: number;
	};
};

const DiscountCard = ({ item }: Props) => {
	const classname = cn("text-md text-muted", !true && "-foreground");

	return (
		<View className="flex-row items-center gap-4 rounded-lg border-r-accent bg-gray-300 p-2 shadow-md dark:bg-gray-700">
			<Text className={cn(classname, "min-w-[105]")}>
				{new Date(item.serviceDate).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				})}
			</Text>
			<Text className={cn(classname, "flex-1 text-left")}>
				{item.technician}
			</Text>
			<Text className={cn(classname, "min-w-[40] text-right")}>
				${item.discount.toFixed(2)}
			</Text>
		</View>
	);
};
