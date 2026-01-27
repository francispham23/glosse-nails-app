import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
	...authTables,
	// Transactions table
	transactions: defineTable({
		compensation: v.float64(),
		compInCash: v.optional(v.float64()),
		compInGift: v.optional(v.float64()),
		compensationMethods: v.array(v.string()),
		tip: v.float64(),
		tipInCash: v.optional(v.float64()),
		tipInGift: v.optional(v.float64()),
		tipMethods: v.array(v.string()),
		discount: v.optional(v.float64()),
		supply: v.optional(v.float64()),
		giftCode: v.optional(v.id("giftCards")),
		client: v.optional(v.id("users")),
		technician: v.id("users"),
		services: v.optional(v.array(v.id("categories"))),
		serviceDate: v.optional(v.number()),
	})
		.index("by_technician", ["technician"])
		.index("by_service_date", ["serviceDate"])
		.index("by_technician_and_date", ["technician", "serviceDate"])
		.index("by_gift_card", ["giftCode"]),

	// Category table
	categories: defineTable({
		name: v.string(),
		description: v.string(),
	}),

	// Service Table
	services: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		price: v.float64(),
		category: v.id("categories"),
	}),

	// Gift Card Table
	giftCards: defineTable({
		client: v.optional(v.id("users")),
		code: v.string(),
		value: v.float64(),
		sellDate: v.number(),
		transactionIds: v.array(v.id("transactions")),
	}).index("by_code", ["code"]),

	// Daily Technician Shift Table
	dailyTechnicianShifts: defineTable({
		technicians: v.array(v.id("users")),
		shiftDate: v.number(),
	})
		.index("by_shift_date", ["shiftDate"])
		.index("by_technician_and_date", ["technicians", "shiftDate"]),
});

export default schema;
