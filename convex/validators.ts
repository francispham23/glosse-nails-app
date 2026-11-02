import { v } from "convex/values";
import schema from "./schema";

export const staffRole = schema.tables.staffRoles.validator.fields.role;
export const userDocument = v.object({
	...schema.tables.users.validator.fields,
	_id: v.id("users"),
	_creationTime: v.number(),
});
export const transactionDocument = v.object({
	...schema.tables.transactions.validator.fields,
	_id: v.id("transactions"),
	_creationTime: v.number(),
});
export const transactionView = v.object({
	...transactionDocument.fields,
	client: v.optional(v.string()),
	technician: v.optional(v.string()),
	services: v.string(),
});
export const giftCardDocument = v.object({
	...schema.tables.giftCards.validator.fields,
	_id: v.id("giftCards"),
	_creationTime: v.number(),
});
export const giftCardView = v.object({
	...giftCardDocument.fields,
	client: v.optional(v.string()),
	balance: v.number(),
});
