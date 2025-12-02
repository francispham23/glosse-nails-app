import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: { userId: v.optional(v.string()) },
	handler: async (ctx, { userId }) => {
		const transactions = await ctx.db.query("transactions").collect();
		type Transaction = (typeof transactions)[number];

		const callback = async (transaction: Transaction) => {
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
		};
		if (userId) {
			return Promise.all(
				transactions
					.filter((transaction) => transaction.technician.toString() === userId)
					.map(callback),
			);
		}

		return Promise.all(transactions.map(callback));
	},
});

// Add a transaction
export const addTransaction = mutation({
	args: {
		body: v.object({
			compensation: v.string(),
			tip: v.string(),
			technicianId: v.id("users"),
		}),
	},
	handler: async (ctx, { body }) => {
		await ctx.db.insert("transactions", {
			compensation: Number(body.compensation),
			tip: Number(body.tip),
			technician: body.technicianId,
			serviceDate: Date.now(),
		});
	},
});
