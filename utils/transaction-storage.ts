import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Id } from "@/convex/_generated/dataModel";
import { isBeforeToday, isToday } from "./index";

export type StoredTransaction = {
	_id: string;
	compensation: number;
	tip: number;
	technicianId: Id<"users">;
	technician?: string;
	services: Id<"categories">[];
	servicesText?: string;
	clientId?: Id<"users">;
	client?: string;
	serviceDate: number;
	storedAt: number;
	_creationTime: number;
};

const STORAGE_KEY = "today_transactions";

/**
 * Get all today's transactions from storage
 */
export async function getTodayTransactions(): Promise<StoredTransaction[]> {
	try {
		const stored = await AsyncStorage.getItem(STORAGE_KEY);
		if (!stored) return [];

		const transactions: StoredTransaction[] = JSON.parse(stored);

		// Separate today's and past transactions
		const todayTransactions = transactions.filter((tx) =>
			isToday(tx.serviceDate),
		);
		const pastTransactions = transactions.filter((tx) =>
			isBeforeToday(tx.serviceDate),
		);

		// If there are past transactions, delete them from storage
		if (pastTransactions.length > 0) {
			console.log(
				`Deleting ${pastTransactions.length} past transaction(s) from storage`,
			);
			await AsyncStorage.setItem(
				STORAGE_KEY,
				JSON.stringify(todayTransactions),
			);
		}

		return todayTransactions;
	} catch (error) {
		console.error("Error getting today's transactions:", error);
		return [];
	}
}

/**
 * Add a transaction to storage if it's from today
 */
export async function addTodayTransaction(transaction: {
	compensation: number;
	tip: number;
	technicianId: Id<"users">;
	technician?: string;
	services: Id<"categories">[];
	servicesText?: string;
	clientId?: Id<"users">;
	client?: string;
	serviceDate: number;
}): Promise<void> {
	try {
		// Only store if the transaction is from today
		if (!isToday(transaction.serviceDate)) {
			return;
		}

		const existing = await getTodayTransactions();
		const newTransaction: StoredTransaction = {
			_id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			...transaction,
			storedAt: Date.now(),
			_creationTime: Date.now(),
		};

		const updated = [...existing, newTransaction];
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	} catch (error) {
		console.error("Error adding today's transaction:", error);
		throw error;
	}
}

/**
 * Clear all stored transactions (useful for cleanup or testing)
 */
export async function clearTodayTransactions(): Promise<void> {
	try {
		await AsyncStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error("Error clearing today's transactions:", error);
		throw error;
	}
}

/**
 * Clean up transactions that are no longer from today
 * This should be called periodically or on app startup
 */
export async function cleanupOldTransactions(): Promise<void> {
	try {
		const stored = await AsyncStorage.getItem(STORAGE_KEY);
		if (!stored) return;

		const transactions: StoredTransaction[] = JSON.parse(stored);
		const todayOnly = transactions.filter((tx) => isToday(tx.serviceDate));
		const pastCount = transactions.length - todayOnly.length;

		if (pastCount > 0) {
			console.log(`Cleaning up ${pastCount} past transaction(s) from storage`);
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todayOnly));
		}
	} catch (error) {
		console.error("Error cleaning up old transactions:", error);
	}
}

/**
 * Get users with their total earnings from today's stored transactions
 */
export async function getUsersFromTodayTransactions(): Promise<
	Array<{
		_id: Id<"users">;
		name: string;
		tip: number;
		compensation: number;
	}>
> {
	try {
		const transactions = await getTodayTransactions();

		// Group transactions by technician
		const userMap = new Map<
			string,
			{ name: string; tip: number; compensation: number }
		>();

		for (const tx of transactions) {
			const userId = tx.technicianId;
			const existing = userMap.get(userId);

			if (existing) {
				existing.tip += tx.tip;
				existing.compensation += tx.compensation;
			} else {
				userMap.set(userId, {
					name: tx.technician || "Unknown",
					tip: tx.tip,
					compensation: tx.compensation,
				});
			}
		}

		// Convert map to array
		return Array.from(userMap.entries()).map(([id, data]) => ({
			_id: id as Id<"users">,
			...data,
		}));
	} catch (error) {
		console.error("Error getting users from today's transactions:", error);
		return [];
	}
}
