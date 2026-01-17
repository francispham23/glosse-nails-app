import { query } from "./_generated/server";

export const getFormCategories = query({
	args: {},
	handler: async (ctx) => {
		const allCat = await ctx.db.query("categories").collect();
		const notUseCat = ["Special Discounts", "Add-ons", "Extension"];
		return allCat.filter((cat) => !notUseCat.includes(cat.name));
	},
});
