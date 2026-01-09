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
		// TODO: Implement soft delete if there are relational dependencies
		await ctx.db.delete(userId);
	},
});

export const usersByDateRange = query({
	args: {
		startDate: v.number(),
		endDate: v.number(),
	},
	handler: async (ctx, { startDate, endDate }) => {
		const technicians = await ctx.db.query("users").collect();

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

				const compensation = transactions.reduce(
					(sum, t) => sum + t.compensation,
					0,
				);
				const tip = transactions.reduce((sum, t) => sum + t.tip, 0);

				return {
					...tech,
					tip,
					compensation,
				};
			}),
		);
		return result.sort((a, b) => a.compensation - b.compensation);
	},
});

export const getUserById = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	},
});
