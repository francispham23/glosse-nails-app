import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

// Helper function to transform a transaction with related data
async function transformTransaction(
	ctx: QueryCtx,
	transaction: Doc<"transactions">,
) {
	const client = transaction.client && (await ctx.db.get(transaction.client));
	const technician = await ctx.db.get(transaction.technician);
	const services =
		transaction.services && transaction.services.length > 0
			? await Promise.all(
					transaction.services.map((serviceId) =>
						ctx.db.get(serviceId).then((s) => s?.name),
					),
				)
			: [];

	return {
		...transaction,
		serviceDate: transaction.serviceDate,
		services: services.join(", "),
		client: client ? client.name : (transaction.client ?? "Unknown"),
		technician: technician ? technician.name : transaction.technician,
	};
}

export const listByDateRange = query({
	args: {
		startDate: v.number(),
		endDate: v.number(),
	},
	handler: async (ctx, { startDate, endDate }) => {
		const transactions = await ctx.db
			.query("transactions")
			.withIndex("by_service_date", (q) =>
				q.gte("serviceDate", startDate).lte("serviceDate", endDate),
			)
			.order("desc")
			.collect();

		return Promise.all(
			transactions.map((transaction) => transformTransaction(ctx, transaction)),
		);
	},
});

export const listByTechnicianAndDateRange = query({
	args: {
		technicianId: v.id("users"),
		startDate: v.number(),
		endDate: v.number(),
	},
	handler: async (ctx, { technicianId, startDate, endDate }) => {
		const transactions = await ctx.db
			.query("transactions")
			.withIndex("by_technician_and_date", (q) =>
				q
					.eq("technician", technicianId)
					.gte("serviceDate", startDate)
					.lte("serviceDate", endDate),
			)
			.order("desc")
			.collect();

		return Promise.all(
			transactions.map((transaction) => transformTransaction(ctx, transaction)),
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
			services: v.optional(v.array(v.id("categories"))),
			clientId: v.optional(v.id("users")),
			serviceDate: v.number(),
		}),
	},
	handler: async (ctx, { body }) => {
		await ctx.db.insert("transactions", {
			compensation: Number(body.compensation),
			tip: Number(body.tip),
			technician: body.technicianId,
			services: body.services || [],
			client: body.clientId,
			serviceDate: body.serviceDate,
		});
	},
});

export const bulkInsertTransactions = mutation({
	args: {
		transactions: v.array(
			v.object({
				compensation: v.string(),
				tip: v.string(),
				technicianId: v.id("users"),
				services: v.optional(v.array(v.id("categories"))),
				clientId: v.optional(v.id("users")),
				serviceDate: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		const { transactions } = args;

		for (const transaction of transactions) {
			await ctx.db.insert("transactions", {
				compensation: Number(transaction.compensation),
				tip: Number(transaction.tip),
				technician: transaction.technicianId,
				services: transaction.services || [],
				client: transaction.clientId,
				serviceDate: transaction.serviceDate,
			});
		}
	},
});
