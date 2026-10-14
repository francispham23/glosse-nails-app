import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { modalScreenClassName } from "@/components/workspace/modal-screen";
import { api } from "@/convex/_generated/api";
import { cn, formatDate } from "@/utils";
import { giftUsageCents } from "@/utils/money";

export default function GiftRoute() {
	const params = useLocalSearchParams();
	const [fallbackDate] = useState(() => Date.now());
	const startDate = params.startDate ? Number(params.startDate) : fallbackDate;
	const endDate = params.endDate ? Number(params.endDate) : fallbackDate;
	const gifts = useQuery(api.giftCards.listByDateRange, {
		startDate,
		endDate,
	});

	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate,
		endDate,
	});

	const redeemedGifts =
		transactions
			?.filter(
				(tx) =>
					tx.compensationMethods?.includes("Gift Card") ||
					tx.tipMethods?.includes("Gift Card"),
			)
			.map((tx) => {
				return {
					_id: tx._id,
					code: gifts?.find((gift) => gift._id === tx.giftCode)?.code as string,
					balance: giftUsageCents(tx) / 100,
					redeemedDate: tx.serviceDate as number,
					client: tx.client as string | undefined,
					technician: tx.technician as string | undefined,
					_creationTime: tx.serviceDate as number,
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
				Gift Report
			</Text>
			{/* Sell Report */}
			<View className="flex-1 pt-6">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={classname}>Sell Date</Text>
					<Text className={classname}>Code</Text>
					<Text className={cn(classname, "text-right")}>Buy</Text>
				</View>

				<FlatList
					data={gifts}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => <GiftCard item={item} />}
					contentContainerClassName="gap-2"
					ListEmptyComponent={<ListEmptyComponent item="gift card" />}
				/>
			</View>

			{/* Redeem Report */}
			<View className="flex-1 pt-6">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={classname}>Redeem Date</Text>
					<Text className={classname}>Technician</Text>
					<Text className={classname}>Code</Text>
					<Text className={cn(classname, "text-right")}>Spend</Text>
				</View>

				<FlatList
					data={redeemedGifts}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => <GiftCard item={item} />}
					contentContainerClassName="gap-2"
					ListEmptyComponent={<ListEmptyComponent item="transaction" />}
				/>
			</View>
		</Animated.View>
	);
}

type Props = {
	item: {
		_id: string;
		_creationTime: number;
		code: string;
		client?: string;
		balance?: number;
		sellDate?: number;
		value?: number;
		technician?: string;
		redeemedDate?: number;
	};
};

const GiftCard = ({ item }: Props) => {
	const classname = cn("text-md text-muted");

	return (
		<View className="flex-row items-center gap-4 rounded-lg border-r-accent bg-background-secondary p-2 shadow-md">
			<Text className={cn(classname, "min-w-[105]")}>
				{formatDate(item.redeemedDate ?? item.sellDate)}
			</Text>
			{item.redeemedDate ? (
				<Text className={cn(classname, "flex-1")}>{item.technician}</Text>
			) : null}
			<Text
				className={cn(
					classname,
					item.redeemedDate ? "text-center" : "flex-1 text-center",
				)}
			>
				{item.code}
			</Text>
			<Text
				className={cn(
					classname,
					item.redeemedDate ? "min-w-[70] text-right" : "min-w-[90] text-right",
				)}
			>
				${item.redeemedDate ? item.balance?.toFixed(2) : item.value?.toFixed(2)}
			</Text>
		</View>
	);
};
