import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const create = mutation({
  handler: async (ctx, { name, email }) => {
    const user = { name, email };
    return await ctx.db.insert("users", user);
  },
});
