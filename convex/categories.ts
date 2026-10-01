import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireActor } from "./authz";

export const getFormCategories = query({
	returns: v.array(
		v.object({
			_id: v.id("categories"),
			_creationTime: v.number(),
			name: v.string(),
			description: v.string(),
		}),
	),
	args: {},
	handler: async (ctx) => {
		await requireActor(ctx);
		const allCat = await ctx.db.query("categories").collect();
		const notUseCat = ["Special Discounts", "Add-ons", "Combo", "Extension"];
		return allCat.filter((cat) => !notUseCat.includes(cat.name));
	},
});
