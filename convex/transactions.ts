import { query } from "./_generated/server";

export const transactions = query({
	args: {},
	handler: async (ctx) => {
		const txs = await ctx.db.query("transactions").collect();

		// For each transaction fetch the referenced user docs and map to names
		const result = await Promise.all(
			txs.map(async (t) => {
				const technician = t.technician ? await ctx.db.get(t.technician) : null;
				const client = t.client ? await ctx.db.get(t.client) : null;

				return {
					_id: t._id,
					technician: technician?.name ?? null,
					client: client?.name ?? null,
					compensation: t.compensation,
					tip: t.tip,
					_creationTime: t._creationTime,
				};
			}),
		);

		return result;
	},
});
