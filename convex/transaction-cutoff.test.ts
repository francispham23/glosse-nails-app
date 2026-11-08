/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob([
	"./**/*.ts",
	"./_generated/*.js",
	"!./**/*.test.ts",
	"!./**/*.d.ts",
]);
const before = Date.parse("2026-11-08T04:59:59.999Z"); // Vancouver Nov 7, 21:59:59.999
const cutoff = before + 1;
afterEach(() => vi.restoreAllMocks());

test("technician writes close at Vancouver 22:00, remain closed next day, and denial changes no money or gift records", async () => {
	const clock = vi.spyOn(Date, "now").mockReturnValue(before);
	const t = convexTest(schema, modules);
	const { technicianId, managerId, giftId } = await t.run(async (ctx) => {
		const technicianId = await ctx.db.insert("users", { name: "Cutoff tech" });
		const managerId = await ctx.db.insert("users", { name: "Manager" });
		for (const [userId, role] of [
			[technicianId, "technician"],
			[managerId, "manager"],
		] as const)
			await ctx.db.insert("staffRoles", {
				userId,
				role,
				isActive: true,
				payRate: 0.5,
				updatedAt: before,
			});
		const giftId = await ctx.db.insert("giftCards", {
			code: "CUTOFF",
			value: 100,
			sellDate: before,
			transactionIds: [],
		});
		return { technicianId, managerId, giftId };
	});
	const tech = t.withIdentity({ subject: technicianId });
	const manager = t.withIdentity({ subject: managerId });
	const body = {
		technicianId,
		serviceDate: before,
		compensation: "20",
		compensationMethods: ["Gift Card"],
		compInGift: "20",
		tip: "0",
		tipMethods: ["Cash"],
		giftCode: "CUTOFF",
	};
	await tech.mutation(api.transactions.addTransaction, { body });
	const snapshot = () =>
		t.run(async (ctx) => ({
			rows: await ctx.db.query("transactions").collect(),
			gift: await ctx.db.get(giftId),
		}));
	const original = await snapshot();
	const id = original.rows[0]._id;
	await tech.mutation(api.transactions.updateTransaction, { id, body });
	clock.mockReturnValue(cutoff);
	await expect(
		tech.mutation(api.transactions.updateTransaction, {
			id,
			body: { ...body, compensation: "30", compInGift: "30" },
		}),
	).rejects.toThrow(/10 PM Vancouver/);
	await expect(
		tech.mutation(api.transactions.addTransaction, { body }),
	).rejects.toThrow(/10 PM Vancouver/);
	expect(await snapshot()).toEqual(original);
	clock.mockReturnValue(Date.parse("2026-11-08T19:00:00Z")); // next salon day, noon
	await expect(
		tech.mutation(api.transactions.updateTransaction, {
			id,
			body: { ...body, serviceDate: Date.now() },
		}),
	).rejects.toThrow(/10 PM Vancouver/);
	await expect(
		tech.mutation(api.transactions.addTransaction, { body }),
	).rejects.toThrow(/10 PM Vancouver/);
	await expect(
		tech.mutation(api.transactions.addTransaction, {
			body: { ...body, serviceDate: Date.parse("2026-11-09T19:00:00Z") },
		}),
	).rejects.toThrow(/10 PM Vancouver/);
	await tech.mutation(api.transactions.addTransaction, {
		body: { ...body, serviceDate: Date.now() },
	});
	await manager.mutation(api.transactions.updateTransaction, { id, body });
});
