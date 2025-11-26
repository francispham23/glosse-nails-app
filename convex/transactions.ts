import { query } from "./_generated/server";

export const transactions = query({
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
