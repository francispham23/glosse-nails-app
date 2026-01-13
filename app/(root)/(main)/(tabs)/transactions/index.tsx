import Animated from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { TransactionCard } from "@/components/transaction-card";
import { api } from "@/convex/_generated/api";
import { useLoadTransactions } from "@/hooks/useLoadTransactions";
import type { Transaction } from "@/utils/types";

export default function Transactions() {
	const { transactions } = useLoadTransactions(
		api.transactions.listByDateRange,
	);

	return (
		<Animated.FlatList
			contentInsetAdjustmentBehavior="automatic"
			contentContainerClassName="gap-4 pt-2 px-3 pb-24"
			data={transactions}
			renderItem={({ item }: { item: Transaction }) => (
				<TransactionCard transaction={item} />
			)}
			keyExtractor={(item) => item._id.toString()}
			ListEmptyComponent={<ListEmptyComponent item="transaction" />}
		/>
	);
}
