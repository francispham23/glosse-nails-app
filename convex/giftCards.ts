import { ConvexError, v } from "convex/values";
import { assertDate, assertMoney } from "../utils/financial-validation";
import { giftUsageCents, moneyToCents, roundMoney } from "../utils/money";
import { mutation, query } from "./_generated/server";
import { requireActor, requireAnyRole, requireSelfOrRole } from "./authz";
import { giftCardDocument, giftCardView } from "./validators";

export const list = query({
	returns: v.array(giftCardView),
	args: {},
	handler: async (ctx) => {
		await requireActor(ctx);
		const giftCards = await ctx.db.query("giftCards").collect();

		return Promise.all(
			giftCards.map(async (giftCard) => {
				const client = giftCard.client && (await ctx.db.get(giftCard.client));
				// Calculate balance based on transactions
				const transactions = await ctx.db
					.query("transactions")
					.withIndex("by_gift_card", (q) => q.eq("giftCode", giftCard._id))
					.collect();
				const totalRedeemed = transactions.reduce(
					(sum, tx) => sum + giftUsageCents(tx),
					0,
				);
				const balance = (moneyToCents(giftCard.value) - totalRedeemed) / 100;

				return {
					...giftCard,
					balance: transactions.length === 0 ? giftCard.value : balance,
					client: client ? client.name : undefined,
				};
			}),
		);
	},
});

export const getByCode = query({
	returns: v.union(
		v.null(),
		v.object({ ...giftCardDocument.fields, balance: v.number() }),
	),
	args: { code: v.string(), transactionId: v.optional(v.id("transactions")) },
	handler: async (ctx, args) => {
		await requireActor(ctx);
		const code = args.code.trim();
		if (!code) {
			return null;
		}
		// Editing a transaction may exclude its redemption, but only its owner
		// or management may use that transaction to adjust a balance quote.
		if (args.transactionId) {
			const transaction = await ctx.db.get(args.transactionId);
			if (!transaction) throw new Error("Transaction not found");
			await requireSelfOrRole(ctx, transaction.technician, [
				"owner",
				"manager",
			]);
		}

		const giftCard = await ctx.db
			.query("giftCards")
			.withIndex("by_code", (q) => q.eq("code", code))
			.first();

		if (!giftCard) {
			return null;
		}

		// Calculate balance only for the matching gift card.
		const transactions = await ctx.db
			.query("transactions")
			.withIndex("by_gift_card", (q) => q.eq("giftCode", giftCard._id))
			.collect();

		const totalRedeemed = transactions
			.filter((tx) => tx._id !== args.transactionId)
			.reduce((sum, tx) => sum + giftUsageCents(tx), 0);

		const balance = (moneyToCents(giftCard.value) - totalRedeemed) / 100;

		return { ...giftCard, balance };
	},
});

export const create = mutation({
	returns: v.id("giftCards"),
	args: {
		code: v.string(),
		value: v.float64(),
		sellDate: v.number(),
	},
	handler: async (ctx, args) => {
		await requireAnyRole(ctx, ["owner", "manager"]);
		const code = args.code.trim();
		let value: number;
		try {
			if (!code) throw new Error("Gift card code is required");
			assertMoney(args.value, "Gift value");
			value = roundMoney(args.value);
			if (value <= 0)
				throw new Error("Gift value must be positive after rounding");
			assertDate(args.sellDate, "Sell date");
		} catch (error) {
			if (error instanceof Error) throw new ConvexError(error.message);
			throw error;
		}
		// Check the trimmed code inside the creation mutation.
		const existing = await ctx.db
			.query("giftCards")
			.withIndex("by_code", (q) => q.eq("code", code))
			.first();

		if (existing) {
			throw new ConvexError(`Gift card with code "${code}" already exists`);
		}

		return await ctx.db.insert("giftCards", {
			code,
			value,
			sellDate: args.sellDate,
			transactionIds: [],
		});
	},
});

export const listByDateRange = query({
	returns: v.array(giftCardView),
	args: {
		startDate: v.number(),
		endDate: v.number(),
	},
	handler: async (ctx, args) => {
		await requireActor(ctx);
		const giftCards = await ctx.db
			.query("giftCards")
			.filter((q) =>
				q.and(
					q.gte(q.field("sellDate"), args.startDate),
					q.lte(q.field("sellDate"), args.endDate),
				),
			)
			.collect();

		return Promise.all(
			giftCards.map(async (giftCard) => {
				const client = giftCard.client && (await ctx.db.get(giftCard.client));
				// Calculate balance based on transactions
				const transactions = await ctx.db
					.query("transactions")
					.withIndex("by_gift_card", (q) => q.eq("giftCode", giftCard._id))
					.collect();
				const totalRedeemed = transactions.reduce(
					(sum, tx) => sum + giftUsageCents(tx),
					0,
				);
				const balance = (moneyToCents(giftCard.value) - totalRedeemed) / 100;

				return {
					...giftCard,
					balance: transactions.length === 0 ? giftCard.value : balance,
					client: client ? client.name : undefined,
				};
			}),
		);
	},
});

export const deleteGiftCard = mutation({
	returns: v.null(),
	args: {
		id: v.id("giftCards"),
	},
	handler: async (ctx, args) => {
		await requireAnyRole(ctx, ["owner", "manager"]);
		const giftCard = await ctx.db.get(args.id);
		if (!giftCard) {
			throw new Error("Gift card not found");
		}

		// Ensure gift card has not been used in any transactions
		if (giftCard.transactionIds.length > 0) {
			throw new Error(
				"Cannot delete a gift card that has been used. Only unused gift cards can be deleted.",
			);
		}

		// Check if there are any transactions associated with this gift card
		const transactions = await ctx.db
			.query("transactions")
			.withIndex("by_gift_card", (q) => q.eq("giftCode", args.id))
			.first();

		if (transactions) {
			throw new Error(
				"Cannot delete a gift card with transaction history. Only unused gift cards can be deleted.",
			);
		}

		await ctx.db.delete(args.id);
	},
});
