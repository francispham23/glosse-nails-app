import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { modalScreenClassName } from "@/components/workspace/modal-screen";
import { api } from "@/convex/_generated/api";
import { cn, formatDate, getDiscount } from "@/utils";

export default function DiscountRoute() {
	const params = useLocalSearchParams();
	const [fallbackDate] = useState(() => Date.now());
	const startDate = params.startDate ? Number(params.startDate) : fallbackDate;
	const endDate = params.endDate ? Number(params.endDate) : fallbackDate;
	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate,
		endDate,
		report: true,
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
					discount: getDiscount(tx),
				};
			}) || [];

	const classname = cn("font-semibold text-foreground");

	return (
		<Animated.View
			className={modalScreenClassName()}
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text className={cn("font-extrabold text-3xl text-foreground")}>
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
	const classname = cn("text-md text-muted");

	return (
		<View className="flex-row items-center gap-4 rounded-lg border-r-accent bg-background-secondary p-2 shadow-md">
			<Text className={cn(classname, "min-w-[105]")}>
				{formatDate(item.serviceDate)}
			</Text>
			<Text className={cn(classname, "flex-1 text-left")}>
				{item.technician.split(" ")[0]}
			</Text>
			<Text className={cn(classname, "min-w-[40] text-right")}>
				${item.discount.toFixed(2)}
			</Text>
		</View>
	);
};
