import type { Id } from "../_generated/dataModel";

/**
 * Pure helpers for shaping/deriving transaction and gift-card data.
 *
 * Kept free of any Convex runtime imports (only `Id` types, erased at runtime)
 * so they can be unit-tested in isolation without a backend or the Convex
 * server module graph.
 */

// Helper function to prepare transaction data for insertion.
// Money strings are parsed to numbers and rounded to 2 decimals.
export function prepareTransactionData(transaction: {
	compensation: string;
	compensationMethods: string[];
	tip: string;
	tipMethods: string[];
	technicianId: Id<"users">;
	serviceDate: number;
	compInCash?: string;
	tipInCash?: string;
	compInGift?: string;
	tipInGift?: string;
	services?: Id<"categories">[];
	clientId?: Id<"users">;
	discount?: string;
	discountType?: "Amount" | "Percent";
	isCashDiscount?: boolean;
	supply?: string;
	isCashSupply?: boolean;
	payRateSnapshot?: number;
	giftCode?: Id<"giftCards">;
}) {
	return {
		compensation: Number.parseFloat(
			Number.parseFloat(transaction.compensation).toFixed(2),
		),
		compInCash: transaction.compInCash
			? Number.parseFloat(Number.parseFloat(transaction.compInCash).toFixed(2))
			: undefined,
		compInGift: transaction.compInGift
			? Number.parseFloat(Number.parseFloat(transaction.compInGift).toFixed(2))
			: undefined,
		compensationMethods: transaction.compensationMethods,
		tip: Number.parseFloat(Number.parseFloat(transaction.tip).toFixed(2)),
		tipInCash: transaction.tipInCash
			? Number.parseFloat(Number.parseFloat(transaction.tipInCash).toFixed(2))
			: undefined,
		tipInGift: transaction.tipInGift
			? Number.parseFloat(Number.parseFloat(transaction.tipInGift).toFixed(2))
			: undefined,
		tipMethods: transaction.tipMethods,
		technician: transaction.technicianId,
		services: transaction.services,
		client: transaction.clientId,
		serviceDate: transaction.serviceDate,
		discount: transaction.discount
			? Number.parseFloat(transaction.discount)
			: undefined,
		discountType: transaction.discount ? transaction.discountType : undefined,
		isCashDiscount: transaction.isCashDiscount,
		supply: transaction.supply
			? Number.parseFloat(transaction.supply)
			: undefined,
		isCashSupply: transaction.isCashSupply,
		payRateSnapshot: transaction.payRateSnapshot,
		giftCode: transaction.giftCode,
	};
}

const TAX_RATE = 1.05; // 5% tax on gift card redemptions

/**
 * Pure helper: remaining balance on a gift card given its face `value` and the
 * transactions that redeemed against it. `excludeTransactionId` lets a caller
 * ignore a transaction being edited (so the balance shown in the edit form
 * excludes the in-progress redemption).
 */
export function computeGiftCardBalance(
	value: number,
	transactions: {
		_id?: Id<"transactions">;
		compInGift?: number;
		supply?: number;
		tipInGift?: number;
	}[],
	excludeTransactionId?: Id<"transactions">,
) {
	const totalRedeemed = transactions
		.filter((tx) => tx._id !== excludeTransactionId)
		.reduce((sum, tx) => {
			return (
				sum +
				((tx.compInGift || 0) + (tx.supply || 0)) * TAX_RATE +
				(tx.tipInGift || 0)
			);
		}, 0);

	const balance = Number.parseFloat((value - totalRedeemed).toFixed(2));
	return transactions.length === 0 ? value : balance;
}
