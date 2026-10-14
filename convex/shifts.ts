import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireActor, requireAnyRole } from "./authz";

// Save technicians for today's shift
export const saveShift = mutation({
	returns: v.id("dailyTechnicianShifts"),
	args: {
		technicians: v.array(v.id("users")),
		shiftDate: v.number(),
	},
	handler: async (ctx, args) => {
		await requireAnyRole(ctx, ["owner", "manager"]);
		// Check if shift already exists for this date
		const existingShift = await ctx.db
			.query("dailyTechnicianShifts")
			.withIndex("by_shift_date", (q) => q.eq("shiftDate", args.shiftDate))
			.first();

		if (existingShift) {
			// Update existing shift
			await ctx.db.patch(existingShift._id, {
				technicians: args.technicians,
			});
			return existingShift._id;
		}

		// Create new shift
		const shiftId = await ctx.db.insert("dailyTechnicianShifts", {
			technicians: args.technicians,
			shiftDate: args.shiftDate,
		});

		return shiftId;
	},
});

// Get technicians for a specific shift date
export const getShiftByDate = query({
	returns: v.union(
		v.null(),
		v.array(
			v.object({
				_id: v.id("users"),
				_creationTime: v.number(),
				name: v.optional(v.string()),
				image: v.optional(v.string()),
			}),
		),
	),
	args: {
		shiftDate: v.number(),
	},
	handler: async (ctx, args) => {
		await requireActor(ctx);
		const shift = await ctx.db
			.query("dailyTechnicianShifts")
			.withIndex("by_shift_date", (q) => q.eq("shiftDate", args.shiftDate))
			.first();

		if (!shift) {
			return null;
		}

		// The shared shift directory does not need private account fields.
		const technicians = await Promise.all(
			shift.technicians.map(async (technicianId) => {
				const user = await ctx.db.get(technicianId);
				return user
					? {
							_id: user._id,
							_creationTime: user._creationTime,
							name: user.name,
							image: user.image,
						}
					: null;
			}),
		);

		// Filter out null values (in case a user was deleted)
		return technicians.filter((tech) => tech !== null);
	},
});
