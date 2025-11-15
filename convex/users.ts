import { getAuthUserId } from "@convex-dev/auth/server";
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

export const users = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("users").collect();
	},
});
