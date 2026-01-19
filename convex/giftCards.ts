import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("giftCards").collect();
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
		});
	},
});
