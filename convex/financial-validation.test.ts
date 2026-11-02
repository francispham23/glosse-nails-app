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
const date = Date.UTC(2026, 8, 30);
async function fixture(value = 100) {
	const t = convexTest(schema, modules);
	const ids = await t.run(async (ctx) => {
		const manager = await ctx.db.insert("users", { name: "Manager" });
		const technician = await ctx.db.insert("users", { name: "Tech" });
		const other = await ctx.db.insert("users", { name: "Other" });
		await ctx.db.insert("staffRoles", {
			userId: manager,
			role: "manager",
			isActive: true,
			updatedAt: date,
		});
		const role = await ctx.db.insert("staffRoles", {
			userId: technician,
			role: "technician",
			payRate: 0.5,
			isActive: true,
			updatedAt: date,
		});
		await ctx.db.insert("staffRoles", {
			userId: other,
			role: "technician",
			payRate: 0.6,
			isActive: true,
			updatedAt: date,
		});
		return { manager, technician, other, role };
	});
	const client = t.withIdentity({ subject: ids.manager });
	const card = await client.mutation(api.giftCards.create, {
		code: "GIFT",
		value,
		sellDate: date,
	});
	const body = {
		technicianId: ids.technician,
		compensation: "100",
		compensationMethods: ["Card"],
		tip: "20",
		tipMethods: ["Card"],
		serviceDate: date,
	};
	const gift = {
		...body,
		compensationMethods: ["Card", "Gift Card"],
		compInGift: "50",
		giftCode: "GIFT",
	};
	const state = () =>
		t.run(async (ctx) => ({
			transactions: await ctx.db.query("transactions").collect(),
			cards: await ctx.db.query("giftCards").collect(),
		}));
	return { t, client, card, body, gift, state, ...ids };
}

test.each([
	"",
	" ",
	"-1",
	"NaN",
	"Infinity",
	"12junk",
	"1e3",
	"9007199254740991",
])("create and edit reject invalid money %s without writes", async (amount) => {
	const f = await fixture();
	await f.client.mutation(api.transactions.addTransaction, { body: f.body });
	const before = await f.state();
	await expect(
		f.client.mutation(api.transactions.addTransaction, {
			body: { ...f.body, compensation: amount },
		}),
	).rejects.toThrow();
	await expect(
		f.client.mutation(api.transactions.updateTransaction, {
			id: before.transactions[0]._id,
			body: { ...f.body, tip: amount },
		}),
	).rejects.toThrow();
	expect(await f.state()).toEqual(before);
});

test.each([
	{ supply: "Infinity" },
	{ compInGift: "12junk" },
	{ discount: "-1" },
	{ compensationMethods: [] },
	{ compensationMethods: ["Wire"] },
	{ tipMethods: ["Card", "Card"] },
	{ compInCash: "1" },
	{ compInGift: "1" },
	{ tipInGift: "1" },
	{ tipMethods: [] },
	{ discount: "101", discountType: "Amount" as const },
	{ discount: "101", discountType: "Percent" as const },
	{ discount: "1" },
	{ compensationMethods: ["Cash", "Card"], compInCash: "106" },
	{ tipMethods: ["Cash", "Card"], tipInCash: "21" },
	{
		...{
			compensationMethods: ["Card", "Gift Card"],
			compInGift: "91",
			giftCode: "GIFT",
		},
		discount: "10",
		discountType: "Amount" as const,
	},
])(
	"invalid methods/portions/discounts reject atomically: %j",
	async (patch) => {
		const f = await fixture();
		await f.client.mutation(api.transactions.addTransaction, { body: f.body });
		const before = await f.state();
		await expect(
			f.client.mutation(api.transactions.addTransaction, {
				body: { ...f.body, ...patch },
			}),
		).rejects.toThrow();
		await expect(
			f.client.mutation(api.transactions.updateTransaction, {
				id: before.transactions[0]._id,
				body: { ...f.body, ...patch },
			}),
		).rejects.toThrow();
		expect(await f.state()).toEqual(before);
	},
);

test.each([undefined, "", "UNKNOWN"])(
	"gift requires a known code: %s",
	async (giftCode) => {
		const f = await fixture();
		await expect(
			f.client.mutation(api.transactions.addTransaction, {
				body: { ...f.gift, giftCode },
			}),
		).rejects.toThrow();
		expect((await f.state()).transactions).toEqual([]);
	},
);

test("shared gift usage accepts exact balance and rejects one cent over across staff", async () => {
	const f = await fixture(105);
	await f.client.mutation(api.transactions.addTransaction, { body: f.gift }); // $52.50
	await f.client.mutation(api.transactions.addTransaction, {
		body: { ...f.gift, technicianId: f.other },
	}); // $52.50
	expect(
		await f.client.query(api.giftCards.getByCode, { code: "GIFT" }),
	).toMatchObject({ balance: 0 });
	const before = await f.state();
	await expect(
		f.t
			.withIdentity({ subject: f.technician })
			.mutation(api.transactions.addTransaction, {
				body: { ...f.gift, compInGift: "0.01" },
			}),
	).rejects.toThrow(/balance/i);
	expect(await f.state()).toEqual(before);
});

test("editing excludes its own usage once; failed edit/switch preserves both references and snapshot", async () => {
	const f = await fixture(52.5);
	await f.client.mutation(api.transactions.addTransaction, { body: f.gift });
	const id = (await f.state()).transactions[0]._id;
	await f.client.mutation(api.transactions.updateTransaction, {
		id,
		body: f.gift,
	});
	await f.client.mutation(api.giftCards.create, {
		code: "SMALL",
		value: 52.49,
		sellDate: date,
	});
	const before = await f.state();
	for (const patch of [
		{ compInGift: "50.01" },
		{ giftCode: "SMALL" },
		{ giftCode: "UNKNOWN" },
	]) {
		await expect(
			f.client.mutation(api.transactions.updateTransaction, {
				id,
				body: { ...f.gift, ...patch },
			}),
		).rejects.toThrow();
		expect(await f.state()).toEqual(before);
	}
});

test.each([-0.1, 1.1, Number.NaN, Number.POSITIVE_INFINITY])(
	"invalid effective rate %s cannot be persisted",
	async (payRate) => {
		const f = await fixture();
		await f.t.run((ctx) => ctx.db.patch(f.role, { payRate }));
		await expect(
			f.client.mutation(api.transactions.addTransaction, { body: f.body }),
		).rejects.toThrow(/rate/i);
		expect((await f.state()).transactions).toEqual([]);
	},
);

test("valid historical snapshot survives an invalid current rate", async () => {
	const f = await fixture();
	await f.client.mutation(api.transactions.addTransaction, { body: f.body });
	const id = (await f.state()).transactions[0]._id;
	await f.t.run((ctx) => ctx.db.patch(f.role, { payRate: 2 }));
	await f.client.mutation(api.transactions.updateTransaction, {
		id,
		body: f.body,
	});
	expect((await f.state()).transactions[0].payRateSnapshot).toBe(0.5);
});

test("cash/gift derives cash remainder without double counting; incompatible explicit cash is rejected", async () => {
	const f = await fixture();
	const body = {
		...f.gift,
		compensationMethods: ["Cash", "Gift Card"],
		compInGift: "40",
		tipMethods: ["Cash", "Gift Card"],
		tipInGift: "5",
	};
	await f.client.mutation(api.transactions.addTransaction, { body });
	expect((await f.state()).transactions[0]).toMatchObject({
		compInCash: 60,
		tipInCash: 15,
	});
	await expect(
		f.client.mutation(api.transactions.addTransaction, {
			body: { ...body, compInCash: "20" },
		}),
	).rejects.toThrow();
	await expect(
		f.client.mutation(api.transactions.addTransaction, {
			body: { ...body, tipInCash: "20" },
		}),
	).rejects.toThrow();
});

test("cash/gift edit accepts its stored pre-tax remainder with cash discount and raw supply", async () => {
	const f = await fixture();
	const body = {
		...f.gift,
		compensationMethods: ["Cash", "Gift Card"],
		compInGift: "40",
		discount: "10",
		discountType: "Amount" as const,
		isCashDiscount: true,
		supply: "0.0049",
		tip: "0",
		tipMethods: [],
	};
	await f.client.mutation(api.transactions.addTransaction, { body });
	const id = (await f.state()).transactions[0]._id;
	await f.client.mutation(api.transactions.updateTransaction, {
		id,
		body: { ...body, compInCash: "60" },
	});
	expect((await f.state()).transactions[0]).toMatchObject({
		compensation: 100,
		compInCash: 60,
		supply: 0.0049,
		discount: 10,
	});
});

test("invalid historical snapshot and reassignment rate reject edits atomically", async () => {
	const f = await fixture();
	await f.client.mutation(api.transactions.addTransaction, { body: f.body });
	const id = (await f.state()).transactions[0]._id;
	await f.t.run((ctx) => ctx.db.patch(id, { payRateSnapshot: 2 }));
	let before = await f.state();
	await expect(
		f.client.mutation(api.transactions.updateTransaction, { id, body: f.body }),
	).rejects.toThrow(/rate/i);
	expect(await f.state()).toEqual(before);
	await f.t.run(async (ctx) => {
		await ctx.db.patch(id, { payRateSnapshot: 0.5 });
		const role = await ctx.db
			.query("staffRoles")
			.withIndex("by_userId", (q) => q.eq("userId", f.other))
			.first();
		if (!role) throw new Error("Expected staff role to exist");
		await ctx.db.patch(role._id, { payRate: -1 });
	});
	before = await f.state();
	await expect(
		f.client.mutation(api.transactions.updateTransaction, {
			id,
			body: { ...f.body, technicianId: f.other },
		}),
	).rejects.toThrow(/rate/i);
	expect(await f.state()).toEqual(before);
});

test.each([
	"compInCash",
	"compInGift",
	"tipInCash",
	"tipInGift",
	"supply",
	"discount",
] as const)("optional %s rejects malformed decimal input", async (field) => {
	const f = await fixture();
	await expect(
		f.client.mutation(api.transactions.addTransaction, {
			body: { ...f.body, [field]: "1junk" },
		}),
	).rejects.toThrow(/decimal/i);
	expect((await f.state()).transactions).toEqual([]);
});

test("ordinary decimals, surrounding whitespace, optional zero and empty tip methods persist safely", async () => {
	const f = await fixture();
	await f.client.mutation(api.transactions.addTransaction, {
		body: {
			...f.body,
			compensation: " .50 ",
			tip: "0",
			tipMethods: [],
			compInCash: "0",
			discount: "0",
			supply: " ",
		},
	});
	expect((await f.state()).transactions[0]).toMatchObject({
		compensation: 0.5,
		tip: 0,
		tipMethods: [],
		compInCash: 0,
		discount: 0,
	});
	expect((await f.state()).transactions[0].supply).toBeUndefined();
});

test.each([
	0,
	-1,
	0.0049,
	Number.NaN,
	Number.POSITIVE_INFINITY,
	Number.MAX_SAFE_INTEGER,
])("gift creation rejects invalid value %s", async (value) => {
	const f = await fixture();
	await expect(
		f.client.mutation(api.giftCards.create, {
			code: "NEW",
			value,
			sellDate: date,
		}),
	).rejects.toThrow();
	expect((await f.state()).cards).toHaveLength(1);
});

test("gift creation trims codes, normalizes cents and rejects empty/duplicate codes and invalid dates", async () => {
	const f = await fixture();
	const id = await f.client.mutation(api.giftCards.create, {
		code: " NEW ",
		value: 1.005,
		sellDate: date,
	});
	expect(await f.t.run((ctx) => ctx.db.get(id))).toMatchObject({
		code: "NEW",
		value: 1.01,
	});
	for (const code of [" ", " GIFT "])
		await expect(
			f.client.mutation(api.giftCards.create, {
				code,
				value: 10,
				sellDate: date,
			}),
		).rejects.toThrow();
	for (const sellDate of [Number.NaN, Number.POSITIVE_INFINITY, 1e20])
		await expect(
			f.client.mutation(api.giftCards.create, {
				code: "BAD-DATE",
				value: 10,
				sellDate,
			}),
		).rejects.toThrow();
});

test("malformed legacy usage fails closed without changing the ledger", async () => {
	const f = await fixture();
	await f.t.run((ctx) =>
		ctx.db.insert("transactions", {
			technician: f.other,
			compensation: 10,
			compensationMethods: ["Gift Card"],
			compInGift: -10,
			tip: 0,
			tipMethods: [],
			giftCode: f.card,
		}),
	);
	const before = await f.state();
	await expect(
		f.client.mutation(api.transactions.addTransaction, { body: f.gift }),
	).rejects.toThrow(/ledger/i);
	expect(await f.state()).toEqual(before);
});

test("competing redemption simulation cannot spend the same balance twice", async () => {
	const f = await fixture(52.5);
	const results = await Promise.allSettled([
		f.client.mutation(api.transactions.addTransaction, { body: f.gift }),
		f.client.mutation(api.transactions.addTransaction, {
			body: { ...f.gift, technicianId: f.other },
		}),
	]);
	expect(
		results.filter((result) => result.status === "fulfilled"),
	).toHaveLength(1);
	expect((await f.state()).transactions).toHaveLength(1);
});
