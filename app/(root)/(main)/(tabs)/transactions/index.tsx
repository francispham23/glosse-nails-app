import { useQuery } from "convex/react";
import { cn } from "heroui-native";
import { Text } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { Transaction } from "@/utils/types";

export default function Transactions() {
	const { isLight } = useAppTheme();

	const transactions = useQuery(api.transactions.transactions);

	const className = cn("text-lg text-muted", !isLight && "-foreground");

	const renderItem = ({ item }: { item: Transaction }) => {
		return (
			<Animated.View
				key={item._id}
				entering={FadeIn}
				exiting={FadeOut}
				className="flex-1 gap-3 rounded-lg border-r-accent bg-background-secondary p-3"
			>
				{/* Render transaction details here */}
				<Text className={className}>Technician: {item.technician}</Text>
				<Text className={className}>Client: {item.client}</Text>
				<Text className={className}>Compensation: ${item.compensation}</Text>
				<Text className={className}>Tip: ${item.tip}</Text>
				<Text className={className}>Transaction ID: {item._id.toString()}</Text>
			</Animated.View>
		);
	};

	if (!transactions) {
		return null;
	}

	return (
		<Animated.FlatList
			contentInsetAdjustmentBehavior="automatic"
			contentContainerClassName="gap-4 pt-2 px-3 pb-24"
			data={transactions}
			renderItem={renderItem}
			keyExtractor={(item) => item._id.toString()}
			itemLayoutAnimation={LinearTransition}
		/>
	);
}
