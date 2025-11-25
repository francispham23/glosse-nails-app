import { useQuery } from "convex/react";
import { cn, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { DataModel } from "@/convex/_generated/dataModel";

export default function Bookmarks() {
	const backgroundColor = useThemeColor("background");
	const transactions = useQuery(api.transactions.transactions);

	if (!transactions) {
		return null;
	}

	return (
		<Animated.FlatList
			contentInsetAdjustmentBehavior="automatic"
			contentContainerClassName="gap-4 pt-2 px-3 pb-24"
			style={{ backgroundColor }}
			data={transactions}
			renderItem={({ item }) => <TransactionDetails transaction={item} />}
			keyExtractor={(item) => item._id.toString()}
			itemLayoutAnimation={LinearTransition}
		/>
	);
}

type TransactionWithNames = {
	_id: DataModel["transactions"]["document"]["_id"];
	technician: string | null;
	client: string | null;
	compensation: number;
	tip: number;
	_creationTime: number;
};

function TransactionDetails({
	transaction,
}: {
	transaction: TransactionWithNames;
}) {
	const { isLight } = useAppTheme();
	const backgroundColor = useThemeColor("background-secondary");

	const className = cn("text-lg text-muted", !isLight && "-foreground");

	return (
		<View
			className="flex-1 gap-3 rounded-lg border-r-accent p-3"
			style={{ backgroundColor }}
		>
			{/* Render transaction details here */}
			<Text className={className}>
				Technician: {transaction.technician ?? "(unknown)"}
			</Text>
			<Text className={className}>
				Client: {transaction.client ?? "(unknown)"}
			</Text>
			<Text className={className}>
				Compensation: ${transaction.compensation}
			</Text>
			<Text className={className}>Tip: ${transaction.tip}</Text>
			<Text className={className}>
				Transaction ID: {transaction._id.toString()}
			</Text>
		</View>
	);
}
