import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
	...authTables,
	// Your other tables...
	transactions: defineTable({
		compensation: v.number(),
		tip: v.number(),
		client: v.id("users"),
		technician: v.id("users"),
	}),
});

export default schema;
