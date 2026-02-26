import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const viewer = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		return userId !== null ? ctx.db.get(userId) : null;
	},
});

export const deleteViewer = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error("Not authenticated");
		}
	},
});

export const usersByDateRange = query({
	args: {
		startDate: v.number(),
		endDate: v.number(),
		report: v.optional(v.boolean()),
	},
	handler: async (ctx, { startDate, endDate, report }) => {
		const technicians = await ctx.db
			.query("users")
			.filter((q) => q.eq(q.field("isAnonymous"), undefined))
			.collect();

		// Return all technicians with total tips and compensation
		const result = await Promise.all(
			technicians.map(async (tech) => {
				// Fetch transactions for this technician (fall back to in-memory filtering to avoid relying on a missing typed index)
				const transactions = (
					await ctx.db
						.query("transactions")
						.withIndex("by_service_date", (q) =>
							q.gte("serviceDate", startDate).lte("serviceDate", endDate),
						)
						.collect()
				).filter((t) => t.technician === tech._id);

				const compensation = Number.parseFloat(
					transactions
						.reduce(
							(sum, t) => sum + (report ? t.compensation / 2 : t.compensation),
							0,
						)
						.toFixed(2),
				);
				let tip: number;
				if (report) {
					const finalTip = transactions.reduce((sum, t) => {
						const nonCashTip = t.tipMethods.includes("Card")
							? t.tip - (t.tipInCash || 0)
							: 0;
						return sum + nonCashTip;
					}, 0);
					tip = Number.parseFloat(finalTip.toFixed(2));
				} else {
					tip = Number.parseFloat(
						transactions.reduce((sum, t) => sum + (t.tip || 0), 0).toFixed(2),
					);
				}

				return {
					...tech,
					tip,
					compensation,
				};
			}),
		);
		if (report) {
			return result.filter((tech) => tech.compensation > 0);
		}
		return result.sort((a, b) => a.compensation - b.compensation);
	},
});

export const getUserById = query({
	args: { userId: v.optional(v.id("users")) },
	handler: async (ctx, { userId }) => {
		if (userId) {
			return await ctx.db.get(userId);
		}
	},
});
