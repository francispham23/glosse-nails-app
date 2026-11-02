/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob([
	"./**/*.ts",
	"./_generated/*.js",
	"!./**/*.test.ts",
	"!./**/*.d.ts",
]);
const makeTest = () => convexTest(schema, modules);
type Client = Pick<ReturnType<typeof makeTest>, "query">;

async function fixture() {
	const t = makeTest();
	const now = Date.now();
	const data = await t.run(async (ctx) => {
		const techA = await ctx.db.insert("users", { name: "A" });
		const techB = await ctx.db.insert("users", { name: "B" });
		const owner = await ctx.db.insert("users", { name: "Owner" });
		const manager = await ctx.db.insert("users", { name: "Manager" });
		const inactive = await ctx.db.insert("users", { name: "Inactive" });
		const roleless = await ctx.db.insert("users", { name: "No role" });
		for (const [userId, role, isActive] of [
			[techA, "technician", true],
			[techB, "technician", true],
			[owner, "owner", true],
			[manager, "manager", true],
			[inactive, "owner", false],
		] as const) {
			await ctx.db.insert("staffRoles", {
				userId,
				role,
				isActive,
				updatedAt: now,
			});
		}
		const gift = await ctx.db.insert("giftCards", {
			code: "TEST",
			value: 100,
			sellDate: now,
			transactionIds: [],
		});
		const values = {
			compensation: 20,
			compensationMethods: ["Cash"],
			tip: 5,
			tipMethods: ["Cash"],
			serviceDate: now,
			giftCode: gift,
		};
		const txA = await ctx.db.insert("transactions", {
			...values,
			technician: techA,
		});
		const txB = await ctx.db.insert("transactions", {
			...values,
			technician: techB,
		});
		await ctx.db.insert("dailyTechnicianShifts", {
			technicians: [techA, techB],
			shiftDate: now,
		});
		await ctx.db.insert("categories", { name: "Nails", description: "Test" });
		return { techA, techB, owner, manager, inactive, roleless, gift, txA, txB };
	});
	return { t, now, ...data };
}
type Fixture = Awaited<ReturnType<typeof fixture>>;
const range = (f: Fixture) => ({
	startDate: f.now - 86_400_000 * 30,
	endDate: f.now,
});
const body = (technicianId: Id<"users">, serviceDate: number) => ({
	technicianId,
	serviceDate,
	compensation: "30",
	compensationMethods: ["Cash"],
	tip: "5",
	tipMethods: ["Cash"],
});

function protectedReads(
	client: Client,
	f: Fixture,
): [string, () => Promise<unknown>][] {
	return [
		[
			"transactions/today",
			() => client.query(api.transactions.listByDateRange, range(f)),
		],
		[
			"transactions/report=false",
			() =>
				client.query(api.transactions.listByDateRange, {
					...range(f),
					report: false,
				}),
		],
		[
			"transactions/report=true",
			() =>
				client.query(api.transactions.listByDateRange, {
					...range(f),
					report: true,
				}),
		],
		[
			"transactions/by technician",
			() =>
				client.query(api.transactions.listByTechnicianAndDateRange, {
					...range(f),
					technicianId: f.techA,
				}),
		],
		[
			"transactions/detail",
			() => client.query(api.transactions.getById, { id: f.txA }),
		],
		[
			"transactions/gift",
			() =>
				client.query(api.transactions.listByGiftCard, { giftCardId: f.gift }),
		],
		["users/summary", () => client.query(api.users.usersByDateRange, range(f))],
		[
			"users/report=false",
			() =>
				client.query(api.users.usersByDateRange, {
					...range(f),
					report: false,
				}),
		],
		[
			"users/report=true",
			() =>
				client.query(api.users.usersByDateRange, { ...range(f), report: true }),
		],
		[
			"users/detail",
			() => client.query(api.users.getUserById, { userId: f.techA }),
		],
		["users/empty argument", () => client.query(api.users.getUserById, {})],
		["viewer", () => client.query(api.users.viewer, {})],
		["viewerRole", () => client.query(api.users.viewerRole, {})],
		["gift/list", () => client.query(api.giftCards.list, {})],
		[
			"gift/code",
			() => client.query(api.giftCards.getByCode, { code: "TEST" }),
		],
		[
			"gift/empty code",
			() => client.query(api.giftCards.getByCode, { code: "" }),
		],
		[
			"gift/date range",
			() => client.query(api.giftCards.listByDateRange, range(f)),
		],
		[
			"shift",
			() => client.query(api.shifts.getShiftByDate, { shiftDate: f.now }),
		],
		["categories", () => client.query(api.categories.getFormCategories, {})],
	];
}

describe("protected backend surface", () => {
	for (const actor of ["anonymous", "roleless", "inactive"] as const) {
		test(`${actor} cannot read operational data`, async () => {
			const f = await fixture();
			const client =
				actor === "anonymous" ? f.t : f.t.withIdentity({ subject: f[actor] });
			for (const [name, call] of protectedReads(client, f)) {
				await expect(call(), name).rejects.toThrow();
			}
		});
	}
	for (const actor of ["owner", "manager", "techA"] as const) {
		test(`${actor} retains permitted reads`, async () => {
			const f = await fixture();
			const client = f.t.withIdentity({ subject: f[actor] });
			for (const [name, call] of protectedReads(client, f)) {
				await expect(call(), name).resolves.not.toBeUndefined();
			}
		});
	}
	test("viewerAccess bootstraps anonymous and unapproved users without operational data", async () => {
		const f = await fixture();
		expect(await f.t.query(api.users.viewerAccess, {})).toEqual({
			authenticated: false,
			role: null,
			isActive: false,
			isAuthorized: false,
			message: "Please sign in to continue.",
		});
		for (const actor of ["roleless", "inactive"] as const) {
			const result = await f.t
				.withIdentity({ subject: f[actor] })
				.query(api.users.viewerAccess, {});
			expect(result).toMatchObject({
				authenticated: true,
				isAuthorized: false,
				user: { _id: f[actor] },
			});
		}
	});
});

describe("technician financial boundaries", () => {
	test("gift lookup cannot exclude another technician's redemption", async () => {
		const f = await fixture();
		await f.t.run(async (ctx) => {
			await ctx.db.patch(f.txB, { compInGift: 30 });
			await ctx.db.patch(f.gift, { transactionIds: [f.txA, f.txB] });
		});
		const client = f.t.withIdentity({ subject: f.techA });
		const gift = await client.query(api.giftCards.getByCode, { code: "TEST" });
		expect(gift?.balance).toBe(68.5);
		await expect(
			client.query(api.giftCards.getByCode, {
				code: "TEST",
				transactionId: f.txB,
			}),
		).rejects.toThrow();
		await expect(
			client.query(api.giftCards.getByCode, {
				code: "TEST",
				transactionId: f.txA,
			}),
		).resolves.toMatchObject({ balance: 68.5 });
		for (const actor of [f.techB, f.owner, f.manager]) {
			await expect(
				f.t.withIdentity({ subject: actor }).query(api.giftCards.getByCode, {
					code: "TEST",
					transactionId: f.txB,
				}),
			).resolves.toMatchObject({ balance: 100 });
		}
		// The shared aggregate remains complete even when visible history is self-only.
		const history = await client.query(api.transactions.listByGiftCard, {
			giftCardId: f.gift,
		});
		expect(history.map((tx) => tx._id)).toEqual([f.txA]);
		if (!gift) throw new Error("Gift card not found");
		expect(gift.value - gift.balance).toBe(31.5);
	});
	test("an owned transaction may switch gift cards without excluding someone else's redemption", async () => {
		const f = await fixture();
		await f.t.run((ctx) =>
			ctx.db.insert("giftCards", {
				code: "OTHER",
				value: 50,
				sellDate: f.now,
				transactionIds: [],
			}),
		);
		const client = f.t.withIdentity({ subject: f.techA });
		await expect(
			client.query(api.giftCards.getByCode, {
				code: "OTHER",
				transactionId: f.txA,
			}),
		).resolves.toMatchObject({ balance: 50 });
		await f.t.run((ctx) => ctx.db.delete(f.txA));
		await expect(
			client.query(api.giftCards.getByCode, {
				code: "OTHER",
				transactionId: f.txA,
			}),
		).rejects.toThrow("Transaction not found");
	});
	for (const report of [undefined, false, true]) {
		test(`lists stay self-only with report=${report}`, async () => {
			const f = await fixture();
			const client = f.t.withIdentity({ subject: f.techA });
			expect(
				(
					await client.query(api.transactions.listByDateRange, {
						...range(f),
						report,
					})
				).map((tx) => tx._id),
			).toEqual([f.txA]);
			expect(
				(
					await client.query(api.users.usersByDateRange, {
						...range(f),
						report,
					})
				).map((user) => user._id),
			).toEqual([f.techA]);
		});
	}
	test("detail and alternate list endpoints cannot bypass ownership", async () => {
		const f = await fixture();
		const client = f.t.withIdentity({ subject: f.techA });
		await expect(
			client.query(api.transactions.getById, { id: f.txB }),
		).rejects.toThrow();
		await expect(
			client.query(api.users.getUserById, { userId: f.techB }),
		).rejects.toThrow();
		await expect(
			client.query(api.transactions.listByTechnicianAndDateRange, {
				...range(f),
				technicianId: f.techB,
			}),
		).rejects.toThrow();
		expect(
			(
				await client.query(api.transactions.listByGiftCard, {
					giftCardId: f.gift,
				})
			).map((tx) => tx._id),
		).toEqual([f.txA]);
	});
	test("a spoofed technician ID cannot authorize editing another record", async () => {
		const f = await fixture();
		const before = await f.t.run((ctx) => ctx.db.get(f.txB));
		await expect(
			f.t
				.withIdentity({ subject: f.techA })
				.mutation(api.transactions.updateTransaction, {
					id: f.txB,
					body: body(f.techA, f.now),
				}),
		).rejects.toThrow();
		expect(await f.t.run((ctx) => ctx.db.get(f.txB))).toEqual(before);
	});
	test("technicians may edit themselves but cannot reassign or create for another technician", async () => {
		const f = await fixture();
		const client = f.t.withIdentity({ subject: f.techA });
		await expect(
			client.mutation(api.transactions.updateTransaction, {
				id: f.txA,
				body: body(f.techB, f.now),
			}),
		).rejects.toThrow();
		await expect(
			client.mutation(api.transactions.addTransaction, {
				body: body(f.techB, f.now),
			}),
		).rejects.toThrow();
		await client.mutation(api.transactions.updateTransaction, {
			id: f.txA,
			body: body(f.techA, f.now),
		});
		expect(await f.t.run((ctx) => ctx.db.get(f.txA))).toMatchObject({
			technician: f.techA,
			compensation: 30,
		});
		await client.mutation(api.transactions.addTransaction, {
			body: body(f.techA, f.now),
		});
		expect(
			await client.query(api.transactions.listByDateRange, range(f)),
		).toHaveLength(2);
	});
});

describe("management boundaries", () => {
	for (const actor of ["anonymous", "roleless", "inactive", "techA"] as const) {
		test(`${actor} cannot perform management writes`, async () => {
			const f = await fixture();
			const client =
				actor === "anonymous" ? f.t : f.t.withIdentity({ subject: f[actor] });
			await expect(
				client.mutation(api.giftCards.create, {
					code: "NEW",
					value: 20,
					sellDate: f.now,
				}),
			).rejects.toThrow();
			await expect(
				client.mutation(api.giftCards.deleteGiftCard, { id: f.gift }),
			).rejects.toThrow();
			await expect(
				client.mutation(api.shifts.saveShift, {
					technicians: [],
					shiftDate: f.now,
				}),
			).rejects.toThrow();
			await expect(
				client.mutation(api.transactions.deleteTransaction, { id: f.txA }),
			).rejects.toThrow();
			if (actor !== "techA") {
				await expect(
					client.mutation(api.transactions.addTransaction, {
						body: body(f.techA, f.now),
					}),
				).rejects.toThrow();
				await expect(
					client.mutation(api.transactions.updateTransaction, {
						id: f.txA,
						body: body(f.techA, f.now),
					}),
				).rejects.toThrow();
			}
			expect(await f.t.run((ctx) => ctx.db.get(f.txA))).not.toBeNull();
			expect(
				await f.t.run((ctx) => ctx.db.query("giftCards").collect()),
			).toHaveLength(1);
		});
	}
	for (const actor of ["owner", "manager"] as const) {
		test(`${actor} may manage records and reassign transactions`, async () => {
			const f = await fixture();
			const client = f.t.withIdentity({ subject: f[actor] });
			expect(
				await client.query(api.transactions.listByDateRange, range(f)),
			).toHaveLength(2);
			await client.mutation(api.transactions.updateTransaction, {
				id: f.txB,
				body: body(f.techA, f.now),
			});
			expect(await f.t.run((ctx) => ctx.db.get(f.txB))).toMatchObject({
				technician: f.techA,
				compensation: 30,
			});
			const gift = await client.mutation(api.giftCards.create, {
				code: "NEW",
				value: 20,
				sellDate: f.now,
			});
			await client.mutation(api.giftCards.deleteGiftCard, { id: gift });
			await client.mutation(api.shifts.saveShift, {
				technicians: [f.techA],
				shiftDate: f.now,
			});
			expect(
				await client.query(api.shifts.getShiftByDate, { shiftDate: f.now }),
			).toMatchObject([{ _id: f.techA }]);
			await client.mutation(api.transactions.deleteTransaction, { id: f.txB });
			expect(await f.t.run((ctx) => ctx.db.get(f.txB))).toBeNull();
		});
	}
});
