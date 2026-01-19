import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save technicians for today's shift
export const saveShift = mutation({
	args: {
		technicians: v.array(v.id("users")),
		shiftDate: v.number(),
	},
	handler: async (ctx, args) => {
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
	args: {
		shiftDate: v.number(),
	},
	handler: async (ctx, args) => {
		const shift = await ctx.db
			.query("dailyTechnicianShifts")
			.withIndex("by_shift_date", (q) => q.eq("shiftDate", args.shiftDate))
			.first();

		if (!shift) {
			return null;
		}

		// Fetch full user details for each technician
		const technicians = await Promise.all(
			shift.technicians.map(async (technicianId) => {
				const user = await ctx.db.get(technicianId);
				return user;
			}),
		);

		// Filter out null values (in case a user was deleted)
		return technicians.filter((tech) => tech !== null);
	},
});
