import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Id } from "@/convex/_generated/dataModel";
import { isBeforeToday, isToday } from "./index";
import type { EarningFormState } from "./types";

export type StoredTransaction = EarningFormState & {
	_id: string;
	_storeTime: number;
	_creationTime: number;
};

const EARNINGS_STORAGE_KEY = "today_earnings";

/**
 * Get all today's transactions from storage
 */
export async function getTodayTransactions(): Promise<StoredTransaction[]> {
	try {
		const stored = await AsyncStorage.getItem(EARNINGS_STORAGE_KEY);
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
				EARNINGS_STORAGE_KEY,
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
 * Store an earning form state to AsyncStorage for later bulk insertion
 */
export async function storeEarningForCheckout(
	earning: EarningFormState,
): Promise<void> {
	try {
		// Only store if the transaction is from today
		if (!isToday(earning.serviceDate)) {
			return;
		}

		const stored = await AsyncStorage.getItem(EARNINGS_STORAGE_KEY);
		const existing: EarningFormState[] = stored ? JSON.parse(stored) : [];

		const newTransaction: StoredTransaction = {
			...earning,
			_id: `local_${earning.serviceDate}_${earning.technicianId}_${earning.tip}_${earning.compensation}`,
			_storeTime: Date.now(),
			_creationTime: Date.now(),
		};

		const updated = [...existing, newTransaction];
		await AsyncStorage.setItem(EARNINGS_STORAGE_KEY, JSON.stringify(updated));
	} catch (error) {
		console.error("Error storing earning:", error);
		throw error;
	}
}

/**
 * Get all stored earnings for checkout
 */
export async function getStoredEarningsForCheckout(): Promise<
	EarningFormState[]
> {
	try {
		const stored = await AsyncStorage.getItem(EARNINGS_STORAGE_KEY);
		if (!stored) return [];

		const earnings: StoredTransaction[] = JSON.parse(stored);

		// Filter only today's earnings
		const todayEarnings = earnings.filter((earning) =>
			isToday(earning.serviceDate),
		);
		// Remove _id, _storeTime, _creationTime before returning
		const cleanedEarnings = todayEarnings.map(
			({ _id, _storeTime, _creationTime, ...rest }) => rest,
		);

		// Update storage if we filtered out any old earnings
		if (cleanedEarnings.length !== earnings.length) {
			await AsyncStorage.setItem(
				EARNINGS_STORAGE_KEY,
				JSON.stringify(cleanedEarnings),
			);
		}

		return cleanedEarnings;
	} catch (error) {
		console.error("Error getting stored earnings:", error);
		return [];
	}
}

/**
 * Clear stored earnings after successful checkout
 */
export async function clearStoredEarnings(): Promise<void> {
	try {
		await AsyncStorage.removeItem(EARNINGS_STORAGE_KEY);
	} catch (error) {
		console.error("Error clearing stored earnings:", error);
		throw error;
	}
}

/**
 * Clear all stored transactions (useful for cleanup or testing)
 */
export async function clearTodayTransactions(): Promise<void> {
	try {
		await AsyncStorage.removeItem(EARNINGS_STORAGE_KEY);
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
		const stored = await AsyncStorage.getItem(EARNINGS_STORAGE_KEY);
		if (!stored) return;

		const transactions: StoredTransaction[] = JSON.parse(stored);
		const todayOnly = transactions.filter((tx) => isToday(tx.serviceDate));
		const pastCount = transactions.length - todayOnly.length;

		if (pastCount > 0) {
			console.log(`Cleaning up ${pastCount} past transaction(s) from storage`);
			await AsyncStorage.setItem(
				EARNINGS_STORAGE_KEY,
				JSON.stringify(todayOnly),
			);
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
		tip: number;
		compensation: number;
	}>
> {
	try {
		const transactions = await getTodayTransactions();

		// Group transactions by technician
		const userMap = new Map<string, { tip: number; compensation: number }>();

		for (const tx of transactions) {
			const userId = tx.technicianId;
			const existing = userMap.get(userId);

			if (existing) {
				existing.tip += Number(tx.tip);
				existing.compensation += Number(tx.compensation);
			} else {
				userMap.set(userId, {
					tip: Number(tx.tip),
					compensation: Number(tx.compensation),
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
