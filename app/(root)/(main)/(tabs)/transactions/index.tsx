import { useQuery } from "convex/react";
import Animated, { LinearTransition } from "react-native-reanimated";

import { TransactionCard } from "@/components/transaction-card";
import { api } from "@/convex/_generated/api";
import type { Transaction } from "@/utils/types";

export default function Transactions() {
	const transactions = useQuery(api.transactions.list, {});

	if (!transactions) {
		return null;
	}

	return (
		<Animated.FlatList
			contentInsetAdjustmentBehavior="automatic"
			contentContainerClassName="gap-4 pt-2 px-3 pb-24"
			data={transactions}
			renderItem={({ item }: { item: Transaction }) => {
				return <TransactionCard transaction={item} />;
			}}
			keyExtractor={(item) => item._id.toString()}
			itemLayoutAnimation={LinearTransition}
		/>
	);
}
