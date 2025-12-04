import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const transactions = await ctx.db
			.query("transactions")
			.order("desc")
			.collect();

		return Promise.all(
			transactions.map(async (transaction) => {
				const client =
					transaction.client && (await ctx.db.get(transaction.client));
				const technician = await ctx.db.get(transaction.technician);
				const services =
					transaction.services && transaction.services?.length > 0
						? await Promise.all(
								transaction.services.map((serviceId) =>
									ctx.db.get(serviceId).then((s) => s?.name),
								),
							)
						: [];

				return {
					...transaction,
					serviceDate: getServiceDateString(transaction.serviceDate),
					services: services.join(", "),
					client: client ? client.name : (transaction.client ?? "Unknown"),
					technician: technician ? technician.name : transaction.technician,
				};
			}),
		);
	},
});

export const listByTechnician = query({
	args: { technicianId: v.id("users") },
	handler: async (ctx, { technicianId }) => {
		const transactions = await ctx.db
			.query("transactions")
			.withIndex("by_technician", (q) => q.eq("technician", technicianId))
			.order("desc")
			.collect();

		return Promise.all(
			transactions.map(async (transaction) => {
				const client =
					transaction.client && (await ctx.db.get(transaction.client));
				const technician = await ctx.db.get(transaction.technician);
				const services =
					transaction.services && transaction.services?.length > 0
						? await Promise.all(
								transaction.services.map((serviceId) =>
									ctx.db.get(serviceId).then((s) => s?.name),
								),
							)
						: [];

				return {
					...transaction,
					serviceDate: getServiceDateString(transaction.serviceDate),
					services: services.join(", "),
					client: client ? client.name : (transaction.client ?? "Unknown"),
					technician: technician ? technician.name : transaction.technician,
				};
			}),
		);
	},
});

// Add a transaction
export const addTransaction = mutation({
	args: {
		body: v.object({
			compensation: v.string(),
			tip: v.string(),
			technicianId: v.id("users"),
			services: v.optional(v.array(v.id("services"))),
			clientId: v.optional(v.id("users")),
		}),
	},
	handler: async (ctx, { body }) => {
		await ctx.db.insert("transactions", {
			compensation: Number(body.compensation),
			tip: Number(body.tip),
			technician: body.technicianId,
			services: body.services || [],
			client: body.clientId,
			serviceDate: Date.now(),
		});
	},
});

const getServiceDateString = (timestamp: number | undefined) => {
	if (!timestamp) return "";
	const time = new Date(timestamp).toLocaleString();
	const dayInWeek = new Date(timestamp).toLocaleDateString("en-US", {
		weekday: "short",
	});
	return `${dayInWeek}, ${time}.`;
};
