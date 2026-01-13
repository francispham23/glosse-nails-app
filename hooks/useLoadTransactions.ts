import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useAppDate } from "@/contexts/app-date-context";

import { isToday } from "@/utils";
import { getTodayTransactions } from "@/utils/transaction-storage";
import type { Technician, Transaction } from "@/utils/types";

type FilteredTransactions = Transaction & {
	technicianId?: Technician["_id"];
};

export const useLoadTransactions = (
	api: FunctionReference<"query", "public">,
	id?: Technician["_id"],
) => {
	const { startOfDay, endOfDay } = useAppDate();
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	const convexTransactions =
		useQuery(api, {
			technicianId: id || undefined,
			startDate: startOfDay.getTime(),
			endDate: endOfDay.getTime(),
		}) || [];

	const isSelectedDateToday = isToday(endOfDay.getTime());

	// Load transactions from AsyncStorage when screen is focused
	useFocusEffect(
		useCallback(() => {
			if (!isSelectedDateToday) {
				setTransactions(convexTransactions);
				return;
			}
			const loadTransactions = async () => {
				const stored = await getTodayTransactions();

				// Transform StoredTransaction to Transaction format
				const formatted: FilteredTransactions[] = stored.map((tx) => ({
					_id: tx._id as Transaction["_id"],
					_creationTime: tx._creationTime,
					compensation: tx.compensation,
					tip: tx.tip,
					technician: tx.technician || "Unknown",
					technicianId: tx.technicianId,
					client: tx.client || "Unknown",
					services: tx.servicesText,
					serviceDate: tx.serviceDate,
				}));
				setTransactions(
					id ? formatted.filter((tx) => tx.technicianId === id) : formatted,
				);
			};
			loadTransactions();
		}, [isSelectedDateToday, convexTransactions, id]),
	);

	return { transactions };
};
