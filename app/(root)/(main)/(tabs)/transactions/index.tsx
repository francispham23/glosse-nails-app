import { useQuery } from "convex/react";
import { cn } from "heroui-native";
import { Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { Transaction } from "@/utils/types";

export default function Transactions() {
	const transactions = useQuery(api.transactions.list) || [];
	const { isLight } = useAppTheme();

	const className = cn("text-lg text-muted", !isLight && "-foreground");

	return (
		<Animated.FlatList
			contentInsetAdjustmentBehavior="automatic"
			contentContainerClassName="gap-4 pt-2 px-3 pb-24"
			data={transactions}
			renderItem={({ item }: { item: Transaction }) => {
				return (
					<Animated.View
						key={item._id}
						className="gap-3 rounded-lg border-r-accent bg-background-secondary p-3"
						entering={FadeIn}
						exiting={FadeOut}
					>
						<Text className={className}>Technician: {item.technician}</Text>
						<Text className={className}>
							Compensation: ${item.compensation}
						</Text>
						<Text className={className}>Tip: ${item.tip}</Text>
						<Text className={className}>Client: {item.client}</Text>
						{item.services ? (
							<Text className={className}>Services: {item.services}</Text>
						) : null}
						<Text className={className}>
							Date: {getServiceDateString(item.serviceDate)}
						</Text>
					</Animated.View>
				);
			}}
			keyExtractor={(item) => item._id.toString()}
			ListEmptyComponent={<ListEmptyComponent item="transaction" />}
		/>
	);
}

const getServiceDateString = (timestamp: number | undefined) => {
	if (!timestamp) return "";
	const time = new Date(timestamp).toLocaleString();
	const dayInWeek = new Date(timestamp).toLocaleDateString("en-US", {
		weekday: "short",
	});
	return `${dayInWeek}, ${time}.`;
};
