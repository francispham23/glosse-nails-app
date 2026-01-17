import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
	...authTables,
	// Your other tables...
	transactions: defineTable({
		compensation: v.float64(),
		compensationMethods: v.array(v.string()),
		tip: v.float64(),
		tipMethods: v.array(v.string()),
		discount: v.optional(v.float64()),
		gift: v.optional(v.float64()),
		giftCode: v.optional(v.id("giftCards")),
		client: v.optional(v.id("users")),
		technician: v.id("users"),
		services: v.optional(v.array(v.id("categories"))),
		serviceDate: v.optional(v.number()),
	})
		.index("by_technician", ["technician"])
		.index("by_service_date", ["serviceDate"])
		.index("by_technician_and_date", ["technician", "serviceDate"]),
	categories: defineTable({
		name: v.string(),
		description: v.string(),
	}),
	services: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		price: v.float64(),
		category: v.id("categories"),
	}),
	giftCards: defineTable({
		code: v.string(),
		balance: v.float64(),
	}),
});

export default schema;
