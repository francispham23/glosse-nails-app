import { v } from "convex/values";

import { query } from "./_generated/server";

export const list = query({
	args: { userId: v.optional(v.string()) },
	handler: async (ctx, { userId }) => {
		const transactions = await ctx.db.query("transactions").collect();
		// For each transaction fetch the referenced user docs and map to names

		if (userId) {
			transactions.filter(
				(transaction) => transaction.technician.toString() === userId,
			);
		}

		return Promise.all(
			transactions.map(async (transaction) => {
				const client =
					transaction.client && (await ctx.db.get(transaction.client));
				const technician = await ctx.db.get(transaction.technician);
				const services = transaction.services
					? await Promise.all(
							transaction.services.map((serviceId) =>
								ctx.db.get(serviceId).then((s) => s?.name),
							),
						)
					: [];

				return {
					...transaction,
					services: services.join(", "),
					client: client ? client.name : transaction.client,
					technician: technician ? technician.name : transaction.technician,
				};
			}),
		);
	},
});
