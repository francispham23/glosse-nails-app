import { useQuery } from "convex/react";
import { useMemo } from "react";
import Animated from "react-native-reanimated";
import { TransactionCard } from "@/components/Cards/transaction-card";
import { ListEmptyComponent } from "@/components/list-empty";
import {
	WorkspaceListFooter,
	WorkspaceScreen,
	workspaceStyles,
} from "@/components/workspace/screen";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import { useAuthorization } from "@/hooks/use-authorization";
import { isToday, type Transaction } from "@/utils";

export default function Transactions() {
	const { startOfDay, endOfDay } = useAppDate();
	const { isAuthorized, user } = useAuthorization();

	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate: startOfDay.getTime(),
		endDate: endOfDay.getTime(),
	});
	const onShiftTechs = useQuery(api.shifts.getShiftByDate, {
		shiftDate: startOfDay.getTime(),
	});

	const isSelectedDateToday = isToday(endOfDay.getTime());
	const isOnShift = onShiftTechs?.some((tech) => tech._id === user?._id);

	const data = useMemo(
		() =>
			isAuthorized || (isSelectedDateToday && isOnShift)
				? transactions
				: transactions?.filter((t) => t.technician === user?.name) || [],
		[isAuthorized, isSelectedDateToday, isOnShift, transactions, user],
	);

	return (
		<WorkspaceScreen
			title="Transactions"
			description="Service records, compensation and tips."
			dateControl
		>
			<Animated.FlatList
				contentContainerStyle={workspaceStyles.list}
				ListFooterComponent={WorkspaceListFooter}
				data={data}
				renderItem={({ item }: { item: Transaction }) => (
					<TransactionCard
						overview
						transaction={item}
						userName={user?.name}
						isAuthorized={isAuthorized}
					/>
				)}
				keyExtractor={(item) => item._id.toString()}
				ListEmptyComponent={
					<ListEmptyComponent
						item="transaction"
						loading={transactions === undefined || onShiftTechs === undefined}
					/>
				}
			/>
		</WorkspaceScreen>
	);
}
