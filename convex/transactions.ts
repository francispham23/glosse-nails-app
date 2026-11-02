import { ConvexError, v } from "convex/values";
import {
	assertDate,
	assertMoney,
	type FinancialInput,
	normalizeFinancialInput,
} from "../utils/financial-validation";
import { giftUsageCents, moneyToCents } from "../utils/money";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
	hasAnyRole,
	requireActor,
	requireAnyRole,
	requireSelfOrRole,
} from "./authz";
import { transactionDocument, transactionView } from "./validators";

async function resolveTechnicianPayRate(
	ctx: MutationCtx,
	technicianId: Id<"users">,
) {
	const roleRecord = (await ctx.db
		.query("staffRoles")
		.withIndex("by_userId", (q) => q.eq("userId", technicianId))
		.first()) as (Doc<"staffRoles"> & { payRate?: number }) | null;

	return roleRecord?.payRate ?? 0.5;
}

// Helper function to transform a transaction with related data
async function transformTransaction(
	ctx: QueryCtx,
	transaction: Doc<"transactions">,
) {
	const client = transaction.client && (await ctx.db.get(transaction.client));
	const technician = await ctx.db.get(transaction.technician);
	const services =
		transaction.services && transaction.services.length > 0
			? await Promise.all(
					transaction.services.map((serviceId) =>
						ctx.db.get(serviceId).then((s) => s?.name),
					),
				)
			: [];

	return {
		...transaction,
		serviceDate: transaction.serviceDate,
		services: services.join(", "),
		client: client ? client.name : (transaction.client ?? "Unknown"),
		technician: technician ? technician.name : transaction.technician,
	};
}

// Shared create/edit validation runs after caller and stored ownership checks.
async function prepareTransactionData(
	ctx: MutationCtx,
	body: FinancialInput & {
		technicianId: Id<"users">;
		serviceDate: number;
		services?: Id<"categories">[];
		clientId?: Id<"users">;
		isCashDiscount?: boolean;
		isCashSupply?: boolean;
	},
	payRateSnapshot: number,
	existing?: Doc<"transactions">,
) {
	try {
		const { usesGift, ...amounts } = normalizeFinancialInput(body);
		assertDate(body.serviceDate, "serviceDate");
		if (
			!Number.isFinite(payRateSnapshot) ||
			payRateSnapshot < 0 ||
			payRateSnapshot > 1
		) {
			throw new Error("Pay rate must be finite and between 0 and 1");
		}
		let giftCode: Id<"giftCards"> | undefined;
		if (usesGift) {
			const giftCardCode = body.giftCode?.trim();
			if (!giftCardCode) throw new Error("Gift card code is required");
			const card = await ctx.db
				.query("giftCards")
				.withIndex("by_code", (q) => q.eq("code", giftCardCode))
				.unique();
			if (!card) throw new Error("Gift card not found");
			giftCode = card._id;
			// A bounded indexed read participates in the same mutation's conflict checks.
			// Fail closed rather than use a partial ledger when the limit is reached.
			const ledger = await ctx.db
				.query("transactions")
				.withIndex("by_gift_card", (q) => q.eq("giftCode", card._id))
				.take(10001);
			if (ledger.length > 10000)
				throw new Error(
					"Gift ledger is too large to validate; contact a manager",
				);
			let used = 0;
			try {
				assertMoney(card.value, "gift value");
				for (const tx of ledger) {
					if (tx._id === existing?._id && existing.giftCode === card._id)
						continue;
					assertMoney(tx.compInGift ?? 0, "gift service");
					assertMoney(tx.tipInGift ?? 0, "gift tip");
					assertMoney(tx.supply ?? 0, "gift supply");
					used += giftUsageCents(tx);
					if (!Number.isSafeInteger(used))
						throw new Error("Unsafe ledger total");
				}
			} catch {
				throw new Error(
					"Invalid gift ledger; contact a manager before redeeming this card",
				);
			}
			if (used + giftUsageCents(amounts) > moneyToCents(card.value))
				throw new Error("Insufficient gift card balance");
		}
		return {
			...amounts,
			compensationMethods: body.compensationMethods,
			tipMethods: body.tipMethods,
			technician: body.technicianId,
			serviceDate: body.serviceDate,
			services: body.services,
			client: body.clientId,
			isCashDiscount: body.isCashDiscount,
			isCashSupply: body.isCashSupply,
			payRateSnapshot,
			giftCode,
		};
	} catch (error) {
		if (error instanceof Error) throw new ConvexError(error.message);
		throw error;
	}
}

async function syncGiftReferences(
	ctx: MutationCtx,
	cardId: Id<"giftCards"> | undefined,
) {
	if (!cardId) return;
	const card = await ctx.db.get(cardId);
	if (!card) return;
	const ledger = await ctx.db
		.query("transactions")
		.withIndex("by_gift_card", (q) => q.eq("giftCode", cardId))
		.take(10001);
	if (ledger.length > 10000)
		throw new ConvexError(
			"Gift ledger is too large to update; contact a manager",
		);
	await ctx.db.patch(cardId, { transactionIds: ledger.map((tx) => tx._id) });
}

export const listByDateRange = query({
	returns: v.array(transactionView),
	args: {
		startDate: v.number(),
		endDate: v.number(),
		report: v.optional(v.boolean()),
	},
	handler: async (ctx, { startDate, endDate }) => {
		const actor = await requireActor(ctx);
		const canViewAllReportTransactions = hasAnyRole(actor.role, [
			"owner",
			"manager",
		]);

		const transactions = await ctx.db
			.query("transactions")
			.withIndex("by_service_date", (q) =>
				q.gte("serviceDate", startDate).lte("serviceDate", endDate),
			)
			.order("desc")
			.collect();

		const filteredTransactions = !canViewAllReportTransactions
			? transactions.filter(
					(transaction) => transaction.technician === actor.userId,
				)
			: transactions;

		return Promise.all(
			filteredTransactions.map((transaction) =>
				transformTransaction(ctx, transaction),
			),
		);
	},
});

export const listByTechnicianAndDateRange = query({
	returns: v.array(transactionView),
	args: {
		technicianId: v.id("users"),
		startDate: v.number(),
		endDate: v.number(),
	},
	handler: async (ctx, { technicianId, startDate, endDate }) => {
		await requireSelfOrRole(ctx, technicianId, ["owner", "manager"]);
		const transactions = await ctx.db
			.query("transactions")
			.withIndex("by_technician_and_date", (q) =>
				q
					.eq("technician", technicianId)
					.gte("serviceDate", startDate)
					.lte("serviceDate", endDate),
			)
			.order("desc")
			.collect();

		return Promise.all(
			transactions.map((transaction) => transformTransaction(ctx, transaction)),
		);
	},
});

// Add a transaction
export const addTransaction = mutation({
	returns: v.null(),
	args: {
		body: v.object({
			compensation: v.string(),
			compInCash: v.optional(v.string()),
			compInGift: v.optional(v.string()),
			compensationMethods: v.array(v.string()),
			tip: v.string(),
			tipInCash: v.optional(v.string()),
			tipInGift: v.optional(v.string()),
			tipMethods: v.array(v.string()),
			discount: v.optional(v.string()),
			discountType: v.optional(
				v.union(v.literal("Amount"), v.literal("Percent")),
			),
			isCashDiscount: v.optional(v.boolean()),
			supply: v.optional(v.string()),
			isCashSupply: v.optional(v.boolean()),
			giftCode: v.optional(v.string()),
			technicianId: v.id("users"),
			services: v.optional(v.array(v.id("categories"))),
			clientId: v.optional(v.id("users")),
			serviceDate: v.number(),
		}),
	},
	handler: async (ctx, { body }) => {
		await requireSelfOrRole(ctx, body.technicianId, ["owner", "manager"]);
		const payRateSnapshot = await resolveTechnicianPayRate(
			ctx,
			body.technicianId,
		);
		const preparedData = await prepareTransactionData(
			ctx,
			body,
			payRateSnapshot,
		);
		await ctx.db.insert("transactions", preparedData);
		await syncGiftReferences(ctx, preparedData.giftCode);
	},
});

// Get a single transaction by ID
export const getById = query({
	returns: v.union(v.null(), transactionDocument),
	args: {
		id: v.id("transactions"),
	},
	handler: async (ctx, { id }) => {
		await requireActor(ctx);
		const transaction = await ctx.db.get(id);
		if (!transaction) {
			return null;
		}

		await requireSelfOrRole(ctx, transaction.technician, ["owner", "manager"]);
		return transaction;
	},
});

// Get transactions by gift card ID
export const listByGiftCard = query({
	returns: v.array(transactionView),
	args: {
		giftCardId: v.id("giftCards"),
	},
	handler: async (ctx, { giftCardId }) => {
		const actor = await requireActor(ctx);
		const transactions = await ctx.db
			.query("transactions")
			.withIndex("by_gift_card", (q) => q.eq("giftCode", giftCardId))
			.order("desc")
			.collect();

		const visible = hasAnyRole(actor.role, ["owner", "manager"])
			? transactions
			: transactions.filter(
					(transaction) => transaction.technician === actor.userId,
				);
		return Promise.all(
			visible.map((transaction) => transformTransaction(ctx, transaction)),
		);
	},
});

// Update a transaction
export const updateTransaction = mutation({
	returns: v.null(),
	args: {
		id: v.id("transactions"),
		body: v.object({
			compensation: v.string(),
			compInCash: v.optional(v.string()),
			compInGift: v.optional(v.string()),
			compensationMethods: v.array(v.string()),
			tip: v.string(),
			tipInCash: v.optional(v.string()),
			tipInGift: v.optional(v.string()),
			tipMethods: v.array(v.string()),
			discount: v.optional(v.string()),
			discountType: v.optional(
				v.union(v.literal("Amount"), v.literal("Percent")),
			),
			isCashDiscount: v.optional(v.boolean()),
			supply: v.optional(v.string()),
			isCashSupply: v.optional(v.boolean()),
			giftCode: v.optional(v.string()),
			technicianId: v.id("users"),
			services: v.optional(v.array(v.id("categories"))),
			clientId: v.optional(v.id("users")),
			serviceDate: v.number(),
		}),
	},
	handler: async (ctx, { id, body }) => {
		await requireSelfOrRole(ctx, body.technicianId, ["owner", "manager"]);
		const existingTransaction = (await ctx.db.get(id)) as
			| (Doc<"transactions"> & { payRateSnapshot?: number })
			| null;

		if (!existingTransaction) {
			throw new Error("Transaction not found");
		}
		// The incoming technician ID cannot authorize access to the stored record.
		await requireSelfOrRole(ctx, existingTransaction.technician, [
			"owner",
			"manager",
		]);

		const payRateSnapshot =
			existingTransaction.technician === body.technicianId
				? (existingTransaction.payRateSnapshot ??
					(await resolveTechnicianPayRate(ctx, body.technicianId)))
				: await resolveTechnicianPayRate(ctx, body.technicianId);
		const preparedData = await prepareTransactionData(
			ctx,
			body,
			payRateSnapshot,
			existingTransaction,
		);
		await ctx.db.patch(id, preparedData);
		await syncGiftReferences(ctx, preparedData.giftCode);
		if (existingTransaction.giftCode !== preparedData.giftCode) {
			await syncGiftReferences(ctx, existingTransaction.giftCode);
		}
	},
});

// Delete a transaction
export const deleteTransaction = mutation({
	returns: v.null(),
	args: {
		id: v.id("transactions"),
	},
	handler: async (ctx, { id }) => {
		await requireAnyRole(ctx, ["owner", "manager"]);
		const transaction = await ctx.db.get(id);
		if (!transaction) {
			throw new Error("Transaction not found");
		}

		// If transaction used a gift card, remove transaction ID from gift card's transactionIds array
		if (transaction.giftCode) {
			const giftCard = await ctx.db.get(transaction.giftCode);
			if (giftCard) {
				const updatedTransactionIds = (giftCard.transactionIds || []).filter(
					(txId) => txId !== id,
				);
				await ctx.db.patch(transaction.giftCode, {
					transactionIds: updatedTransactionIds,
				});
			}
		}

		await ctx.db.delete(id);
	},
});
