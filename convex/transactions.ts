import { v } from "convex/values";

import { query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const transactions = await ctx.db.query("transactions").collect();
		// For each transaction fetch the referenced user docs and map to names
		return Promise.all(
			transactions.map(async (transaction) => {
				const client = await ctx.db.get(transaction.client);
				const technician = await ctx.db.get(transaction.technician);

				return {
					...transaction,
					client: client ? client.name : transaction.client,
					technician: technician ? technician.name : transaction.client,
				};
			}),
		);
	},
});

export const listByTechnicianId = query({
	args: { userId: v.string() },
	handler: async (ctx, { userId }) => {
		const transactions = await ctx.db.query("transactions").collect();

		return Promise.all(
			transactions
				.filter((transaction) => transaction.technician.toString() === userId)
				.map(async (transaction) => {
					const client = await ctx.db.get(transaction.client);

					return {
						...transaction,
						client: client ? client.name : transaction.client,
						technician: "",
					};
				}),
		);
	},
});
