import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useAppDate } from "@/contexts/app-date-context";
import { api as ConvexAPI } from "@/convex/_generated/api";
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

	// Fetch all users at the top level to look up technician names
	const users = useQuery(ConvexAPI.users.list) || [];
	const categories = useQuery(ConvexAPI.categories.getAllCategories);

	const isSelectedDateToday = isToday(endOfDay.getTime());

	const findUser = useCallback(
		(userId: Technician["_id"]) => {
			return users.find((user) => user._id === userId);
		},
		[users],
	);

	// Load transactions from AsyncStorage when screen is focused
	useFocusEffect(
		useCallback(() => {
			if (!isSelectedDateToday) {
				setTransactions(convexTransactions);
				return;
			}
			const loadTransactions = async () => {
				const stored = await getTodayTransactions();

				const formattedTransactions = stored.map((transaction) => {
					const technician = findUser(transaction.technicianId);
					const client = transaction.clientId && findUser(transaction.clientId);
					const filteredServices = categories?.filter((cat) =>
						transaction.services.includes(cat._id),
					);
					const services = filteredServices?.map((cat) => cat.name).join(", ");

					return {
						_id: transaction._id,
						technician: technician?.name,
						tip: transaction.tip,
						compensation: transaction.compensation,
						services: services,
						serviceDate: transaction.serviceDate,
						_creationTime: transaction._creationTime,
						client: client?.name,
					} as unknown as FilteredTransactions;
				});

				setTransactions(
					id
						? formattedTransactions.filter((tx) => tx.technicianId !== id)
						: formattedTransactions,
				);
			};
			loadTransactions();
		}, [isSelectedDateToday, convexTransactions, id, findUser, categories]),
	);

	return { transactions };
};
