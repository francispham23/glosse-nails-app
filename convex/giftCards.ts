import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAnyRole } from "./authz";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const giftCards = await ctx.db.query("giftCards").collect();

		return Promise.all(
			giftCards.map(async (giftCard) => {
				const client = giftCard.client && (await ctx.db.get(giftCard.client));
				// Calculate balance based on transactions
				const transactions = await ctx.db
					.query("transactions")
					.withIndex("by_gift_card", (q) => q.eq("giftCode", giftCard._id))
					.collect();
				const totalRedeemed = transactions.reduce((sum, tx) => {
					return (
						sum +
						((tx.compInGift || 0) + (tx.supply || 0)) * 1.05 +
						(tx.tipInGift || 0)
					);
				}, 0);
				const balance = Number.parseFloat(
					(giftCard.value - totalRedeemed).toFixed(2),
				);

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
	args: { code: v.string(), transactionId: v.optional(v.id("transactions")) },
	handler: async (ctx, args) => {
		const code = args.code.trim();
		if (!code) {
			return null;
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
			.reduce((sum, tx) => {
				return (
					sum +
					((tx.compInGift || 0) + (tx.supply || 0)) * 1.05 +
					(tx.tipInGift || 0)
				);
			}, 0);

		const balance = Number.parseFloat(
			(giftCard.value - totalRedeemed).toFixed(2),
		);

		return { ...giftCard, balance };
	},
});

export const create = mutation({
	args: {
		code: v.string(),
		value: v.float64(),
		sellDate: v.number(),
	},
	handler: async (ctx, args) => {
		await requireAnyRole(ctx, ["owner", "manager"]);
		// Check if code already exists
		const existing = await ctx.db
			.query("giftCards")
			.withIndex("by_code", (q) => q.eq("code", args.code))
			.first();

		if (existing) {
			throw new Error(`Gift card with code "${args.code}" already exists`);
		}

		return await ctx.db.insert("giftCards", {
			code: args.code,
			value: args.value,
			sellDate: args.sellDate,
			transactionIds: [],
		});
	},
});

export const listByDateRange = query({
	args: {
		startDate: v.number(),
		endDate: v.number(),
	},
	handler: async (ctx, args) => {
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
				const totalRedeemed = transactions.reduce((sum, tx) => {
					return (
						sum +
						((tx.compInGift || 0) + (tx.supply || 0)) * 1.05 +
						(tx.tipInGift || 0)
					);
				}, 0);
				const balance = Number.parseFloat(
					(giftCard.value - totalRedeemed).toFixed(2),
				);

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
