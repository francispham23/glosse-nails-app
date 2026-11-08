/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob([
	"./**/*.ts",
	"./_generated/*.js",
	"!./**/*.test.ts",
	"!./**/*.d.ts",
]);

test("saving a revised shift replaces the roster for that date", async () => {
	const t = convexTest(schema, modules);
	const shiftDate = Date.UTC(2026, 8, 29);
	const { manager, firstTech, secondTech } = await t.run(async (ctx) => {
		const manager = await ctx.db.insert("users", { name: "Manager" });
		const firstTech = await ctx.db.insert("users", { name: "First" });
		const secondTech = await ctx.db.insert("users", { name: "Second" });
		await ctx.db.insert("staffRoles", {
			userId: manager,
			role: "manager",
			isActive: true,
			updatedAt: shiftDate,
		});
		return { manager, firstTech, secondTech };
	});
	const client = t.withIdentity({ subject: manager });

	const firstId = await client.mutation(api.shifts.saveShift, {
		shiftDate,
		technicians: [firstTech],
	});
	const revisedId = await client.mutation(api.shifts.saveShift, {
		shiftDate,
		technicians: [secondTech],
	});

	expect(revisedId).toBe(firstId);
	expect(
		await client.query(api.shifts.getShiftByDate, { shiftDate }),
	).toMatchObject([{ _id: secondTech, name: "Second" }]);
	expect(
		await t.run((ctx) => ctx.db.query("dailyTechnicianShifts").collect()),
	).toHaveLength(1);
});

test("Vancouver day finds a legacy UTC-8 key and refuses ambiguous duplicates", async () => {
	const t = convexTest(schema, modules);
	const legacy = Date.parse("2026-11-08T08:00:00Z");
	const canonical = Date.parse("2026-11-08T07:00:00Z");
	const { manager, shift } = await t.run(async (ctx) => {
		const manager = await ctx.db.insert("users", { name: "Manager" });
		await ctx.db.insert("staffRoles", {
			userId: manager,
			role: "manager",
			isActive: true,
			updatedAt: canonical,
		});
		const shift = await ctx.db.insert("dailyTechnicianShifts", {
			technicians: [manager],
			shiftDate: legacy,
		});
		return { manager, shift };
	});
	const client = t.withIdentity({ subject: manager });
	expect(
		await client.query(api.shifts.getShiftByDate, { shiftDate: canonical }),
	).toMatchObject([{ _id: manager }]);
	expect(
		await client.mutation(api.shifts.saveShift, {
			shiftDate: canonical,
			technicians: [],
		}),
	).toBe(shift);
	await t.run((ctx) =>
		ctx.db.insert("dailyTechnicianShifts", {
			technicians: [],
			shiftDate: canonical,
		}),
	);
	await expect(
		client.mutation(api.shifts.saveShift, {
			shiftDate: canonical,
			technicians: [manager],
		}),
	).rejects.toThrow(/Multiple shifts/);
	expect(
		await t.run((ctx) => ctx.db.query("dailyTechnicianShifts").collect()),
	).toHaveLength(2);
});
