import { query } from "./_generated/server";

export const transactions = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("transactions").collect();
	},
});
