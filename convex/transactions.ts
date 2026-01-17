import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
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

// Helper function to prepare transaction data for insertion
function prepareTransactionData(transaction: {
	compensation: string;
	compensationMethods: string[];
	tip: string;
	tipMethods: string[];
	technicianId: Id<"users">;
	serviceDate: number;
	clientId?: Id<"users">;
	services?: Id<"categories">[];
	discount?: string;
	gift?: string;
	giftCode?: Id<"giftCards">;
}) {
	return {
		compensation: Number.parseFloat(
			Number.parseFloat(transaction.compensation).toFixed(2),
		),
		compensationMethods: transaction.compensationMethods,
		tip: Number.parseFloat(Number.parseFloat(transaction.tip).toFixed(2)),
		tipMethods: transaction.tipMethods,
		technician: transaction.technicianId,
		services: transaction.services,
		client: transaction.clientId,
		serviceDate: transaction.serviceDate,
		discount: transaction.discount
			? Number.parseFloat(transaction.discount)
			: undefined,
		gift: transaction.gift ? Number.parseFloat(transaction.gift) : undefined,
		giftCode: transaction.giftCode,
	};
}

// Helper function to insert a single transaction
async function insertTransaction(
	ctx: MutationCtx,
	transaction: {
		compensation: string;
		compensationMethods: string[];
		tip: string;
		tipMethods: string[];
		technicianId: Id<"users">;
		serviceDate: number;
		services?: Id<"categories">[];
		clientId?: Id<"users">;
		discount?: string;
		gift?: string;
		giftCode?: Id<"giftCards">;
	},
) {
	await ctx.db.insert("transactions", prepareTransactionData(transaction));
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
			compensationMethods: v.array(v.string()),
			tip: v.string(),
			tipMethods: v.array(v.string()),
			discount: v.optional(v.string()),
			gift: v.optional(v.string()),
			giftCode: v.optional(v.string()),
			technicianId: v.id("users"),
			services: v.optional(v.array(v.id("categories"))),
			clientId: v.optional(v.id("users")),
			serviceDate: v.number(),
		}),
	},
	handler: async (ctx, { body }) => {
		const giftCode = body.giftCode;
		let giftCardId: Id<"giftCards"> | undefined;
		// If a gift code is provided, find giftCard id from giftCards table
		if (giftCode) {
			const giftCard = await ctx.db
				.query("giftCards")
				.filter((q) => q.eq(q.field("code"), giftCode))
				.first();
			if (giftCard) {
				giftCardId = giftCard._id;
			}
		}

		await insertTransaction(ctx, { ...body, giftCode: giftCardId });

		// Reduce gift card balance if a gift card was used
		if (giftCardId && body.gift) {
			const giftCard = await ctx.db.get(giftCardId);
			if (giftCard) {
				const giftAmount = Number.parseFloat(body.gift);
				const newBalance = Number.parseFloat(
					(giftCard.balance - giftAmount).toFixed(2),
				);
				await ctx.db.patch(giftCardId, { balance: newBalance });
			}
		}
	},
});

export const bulkInsertTransactions = mutation({
	args: {
		transactions: v.array(
			v.object({
				compensation: v.string(),
				compensationMethods: v.array(v.string()),
				tip: v.string(),
				tipMethods: v.array(v.string()),
				discount: v.optional(v.string()),
				gift: v.optional(v.string()),
				giftCode: v.optional(v.string()),
				technicianId: v.id("users"),
				services: v.optional(v.array(v.id("categories"))),
				clientId: v.optional(v.id("users")),
				serviceDate: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		await Promise.all(
			args.transactions.map(async (transaction) => {
				let giftCardId: Id<"giftCards"> | undefined;
				if (transaction.giftCode) {
					const giftCard = await ctx.db
						.query("giftCards")
						.filter((q) => q.eq(q.field("code"), transaction.giftCode))
						.first();
					if (giftCard) {
						giftCardId = giftCard._id;
					}
				}

				await insertTransaction(ctx, { ...transaction, giftCode: giftCardId });

				// Reduce gift card balance if a gift card was used
				if (giftCardId && transaction.gift) {
					const giftCard = await ctx.db.get(giftCardId);
					if (giftCard) {
						const giftAmount = Number.parseFloat(transaction.gift);
						const newBalance = Number.parseFloat(
							(giftCard.balance - giftAmount).toFixed(2),
						);
						await ctx.db.patch(giftCardId, { balance: newBalance });
					}
				}
			}),
		);
	},
});
