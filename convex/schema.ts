import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
	...authTables,
	// Your other tables...
	transactions: defineTable({
		compensation: v.float64(),
		tip: v.float64(),
		client: v.optional(v.id("users")),
		technician: v.id("users"),
		services: v.optional(v.array(v.id("services"))),
		serviceDate: v.number(),
	}),
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
});

export default schema;
