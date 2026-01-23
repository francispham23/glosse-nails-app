import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const giftCards = await ctx.db.query("giftCards").collect();

		return Promise.all(
			giftCards.map(async (giftCard) => {
				const client = giftCard.client && (await ctx.db.get(giftCard.client));
				return {
					...giftCard,
					client: client ? client.name : undefined,
				};
			}),
		);
	},
});

export const getByCode = query({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("giftCards")
			.withIndex("by_code", (q) => q.eq("code", args.code))
			.first();
	},
});

export const create = mutation({
	args: {
		code: v.string(),
		balance: v.float64(),
		sellDate: v.number(),
	},
	handler: async (ctx, args) => {
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
			balance: args.balance,
			faceValue: args.balance,
			sellDate: args.sellDate,
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
			.filter(
				(q) =>
					q.gte(q.field("sellDate"), args.startDate) &&
					q.lte(q.field("sellDate"), args.endDate),
			)
			.collect();

		return Promise.all(
			giftCards.map(async (giftCard) => {
				const client = giftCard.client && (await ctx.db.get(giftCard.client));
				return {
					...giftCard,
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
		const giftCard = await ctx.db.get(args.id);
		if (!giftCard) {
			throw new Error("Gift card not found");
		}

		// Check if gift card has been used (balance is less than face value)
		if (giftCard.balance < giftCard.faceValue) {
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
