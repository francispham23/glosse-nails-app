import { useQuery } from "convex/react";
import Animated from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { TransactionCard } from "@/components/transaction-card";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import type { Transaction } from "@/utils/types";

export default function Transactions() {
	const { startOfDay, endOfDay } = useAppDate();
	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate: startOfDay.getTime(),
		endDate: endOfDay.getTime(),
	});

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
