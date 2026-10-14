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
const date = Date.UTC(2026, 8, 29, 12);
const range = { startDate: date - 1000, endDate: date + 1000 };

async function fixture() {
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
		return { manager, technician, other, role };
	});
	const client = t.withIdentity({ subject: ids.manager });
	const body = {
		technicianId: ids.technician,
		serviceDate: date,
		compensation: "100",
		compensationMethods: ["Card"],
		tip: "20",
		tipMethods: ["Card"],
	};
	return { t, client, body, ...ids };
}

test("create, self edit and rate changes preserve historical payroll snapshots", async () => {
	const f = await fixture();
	await f.client.mutation(api.transactions.addTransaction, { body: f.body });
	const [tx] = await f.client.query(api.transactions.listByDateRange, range);
	await f.t.run((ctx) => ctx.db.patch(f.role, { payRate: 0.6 }));
	expect(
		await f.client.query(api.users.usersByDateRange, {
			...range,
			report: true,
		}),
	).toMatchObject([{ compensation: 50, tip: 20 }]);
	await f.client.mutation(api.transactions.updateTransaction, {
		id: tx._id,
		body: { ...f.body, compensation: "120" },
	});
	expect(
		await f.client.query(api.users.usersByDateRange, {
			...range,
			report: true,
		}),
	).toMatchObject([{ compensation: 60, tip: 20 }]);
	await f.client.mutation(api.transactions.addTransaction, { body: f.body });
	expect(
		await f.client.query(api.users.usersByDateRange, {
			...range,
			report: true,
		}),
	).toMatchObject([{ compensation: 120, tip: 40 }]);
});

test.each([
	[undefined, 0.6, 60],
	[undefined, undefined, 50],
	[0, 0.6, 0],
	[0.4, 0.6, 40],
])(
	"legacy/snapshot rate %s with current rate %s produces %s",
	async (snapshot, current, expected) => {
		const f = await fixture();
		await f.t.run(async (ctx) => {
			await ctx.db.patch(f.role, { payRate: current });
			await ctx.db.insert("transactions", {
				technician: f.technician,
				compensation: 100,
				compensationMethods: ["Card"],
				tip: 0,
				tipMethods: ["Card"],
				serviceDate: date,
				payRateSnapshot: snapshot,
			});
		});
		const result = await f.client.query(api.users.usersByDateRange, {
			...range,
			report: true,
		});
		if (expected === 0) expect(result).toEqual([]);
		else expect(result).toMatchObject([{ compensation: expected, tip: 0 }]);
	},
);

test("earnings include every tip while payroll excludes cash tips", async () => {
	const f = await fixture();
	await f.client.mutation(api.transactions.addTransaction, {
		body: { ...f.body, tipMethods: ["Cash", "Card"], tipInCash: "5" },
	});
	await f.client.mutation(api.transactions.addTransaction, {
		body: { ...f.body, compensation: "40", tip: "8", tipMethods: ["Cash"] },
	});
	expect(await f.client.query(api.users.usersByDateRange, range)).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				_id: f.technician,
				compensation: 140,
				tip: 28,
			}),
		]),
	);
	expect(
		await f.client.query(api.users.usersByDateRange, {
			...range,
			report: true,
		}),
	).toMatchObject([{ compensation: 70, tip: 15 }]);
});

test("inclusive dates and technician scoping exclude out-of-range money", async () => {
	const f = await fixture();
	for (const serviceDate of [
		range.startDate - 1,
		range.startDate,
		range.endDate,
		range.endDate + 1,
	]) {
		await f.client.mutation(api.transactions.addTransaction, {
			body: { ...f.body, serviceDate },
		});
	}
	await f.client.mutation(api.transactions.addTransaction, {
		body: { ...f.body, technicianId: f.other, compensation: "30" },
	});
	expect(
		await f.client.query(api.transactions.listByDateRange, range),
	).toHaveLength(3);
	expect(
		await f.client.query(api.transactions.listByTechnicianAndDateRange, {
			...range,
			technicianId: f.technician,
		}),
	).toHaveLength(2);
	expect(
		await f.client.query(api.transactions.listByDateRange, {
			startDate: date + 2000,
			endDate: date + 3000,
		}),
	).toEqual([]);
	const self = f.t.withIdentity({ subject: f.technician });
	expect(
		await self.query(api.transactions.listByDateRange, range),
	).toHaveLength(2);
});

test("gift balance follows create, edit exclusion, card switch, removal and deletion", async () => {
	const f = await fixture();
	const first = await f.client.mutation(api.giftCards.create, {
		code: "FIRST",
		value: 200,
		sellDate: date,
	});
	const second = await f.client.mutation(api.giftCards.create, {
		code: "SECOND",
		value: 100,
		sellDate: date,
	});
	const body = {
		...f.body,
		compensation: "50",
		compInGift: "50",
		tip: "5",
		tipInGift: "5",
		supply: "10",
		compensationMethods: ["Gift Card"],
		tipMethods: ["Gift Card"],
		giftCode: "FIRST",
	};
	const quote = async (code: string) => {
		const result = await f.client.query(api.giftCards.getByCode, { code });
		const all = await f.client.query(api.giftCards.list, {});
		const dated = await f.client.query(api.giftCards.listByDateRange, range);
		expect(all.find((card) => card.code === code)?.balance).toBe(
			result?.balance,
		);
		expect(dated.find((card) => card.code === code)?.balance).toBe(
			result?.balance,
		);
		return result;
	};
	await f.client.mutation(api.transactions.addTransaction, { body });
	const [tx] = await f.client.query(api.transactions.listByGiftCard, {
		giftCardId: first,
	});
	expect(await quote("FIRST")).toMatchObject({ balance: 132 }); // 200 - 52.50 - 10.50 - 5
	expect(await f.client.query(api.giftCards.list, {})).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ _id: first, balance: 132 }),
		]),
	);
	expect(await f.client.query(api.giftCards.listByDateRange, range)).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ _id: first, balance: 132 }),
		]),
	);
	expect(
		await f.client.query(api.giftCards.getByCode, {
			code: "FIRST",
			transactionId: tx._id,
		}),
	).toMatchObject({ balance: 200 });
	await f.client.mutation(api.transactions.addTransaction, {
		body: {
			...body,
			compensation: "10",
			compInGift: "10",
			tip: "0",
			tipInGift: "",
			supply: "",
		},
	});
	expect(await quote("FIRST")).toMatchObject({ balance: 121.5 });
	expect(
		await f.client.query(api.giftCards.getByCode, {
			code: "FIRST",
			transactionId: tx._id,
		}),
	).toMatchObject({ balance: 189.5 });
	await f.client.mutation(api.transactions.updateTransaction, {
		id: tx._id,
		body: { ...body, compInGift: "40" },
	});
	expect(await quote("FIRST")).toMatchObject({ balance: 132 });
	await f.client.mutation(api.transactions.updateTransaction, {
		id: tx._id,
		body: { ...body, giftCode: "SECOND" },
	});
	expect(await quote("FIRST")).toMatchObject({ balance: 189.5 });
	expect(await quote("SECOND")).toMatchObject({ balance: 32 });
	expect(
		await f.client.query(api.transactions.listByGiftCard, {
			giftCardId: second,
		}),
	).toHaveLength(1);
	await f.client.mutation(api.transactions.updateTransaction, {
		id: tx._id,
		body: { ...f.body, giftCode: "" },
	});
	expect(await quote("SECOND")).toMatchObject({
		balance: 100,
		transactionIds: [],
	});
	const [remaining] = await f.client.query(api.transactions.listByGiftCard, {
		giftCardId: first,
	});
	await f.client.mutation(api.transactions.deleteTransaction, {
		id: remaining._id,
	});
	expect(await quote("FIRST")).toMatchObject({
		balance: 200,
		transactionIds: [],
	});
});

test("backend rounds combined taxable usage once per redemption", async () => {
	const f = await fixture();
	await f.client.mutation(api.giftCards.create, {
		code: "CENTS",
		value: 1,
		sellDate: date,
	});
	await f.client.mutation(api.transactions.addTransaction, {
		body: {
			...f.body,
			compensation: "0.10",
			compInGift: "0.10",
			compensationMethods: ["Gift Card"],
			supply: "0.10",
			tip: "0",
			giftCode: "CENTS",
		},
	});
	expect(
		await f.client.query(api.giftCards.getByCode, { code: "CENTS" }),
	).toMatchObject({ balance: 0.79 });
});

test("decimal persistence rounds monetary inputs and preserves zero/empty optional fields", async () => {
	const f = await fixture();
	await f.client.mutation(api.transactions.addTransaction, {
		body: {
			...f.body,
			compensation: "12.346",
			compInCash: "0",
			tip: "0",
			supply: "",
			discount: "",
		},
	});
	const [tx] = await f.t.run((ctx) => ctx.db.query("transactions").collect());
	expect(tx).toMatchObject({ compensation: 12.35, compInCash: 0 });
	expect(tx.supply).toBeUndefined();
	expect(tx.discount).toBeUndefined();
	expect(tx.tip).toBe(0);
});

test("each half-cent gift redemption rounds up before balances are summed", async () => {
	const f = await fixture();
	await f.client.mutation(api.giftCards.create, {
		code: "TIES",
		value: 1,
		sellDate: date,
	});
	for (let i = 0; i < 2; i++) {
		await f.client.mutation(api.transactions.addTransaction, {
			body: {
				...f.body,
				compensation: "0.10",
				compInGift: "0.10",
				compensationMethods: ["Gift Card"],
				tip: "0",
				giftCode: "TIES",
			},
		});
	}
	// Each $0.105 redemption consumes $0.11, for $0.22 total.
	expect(
		await f.client.query(api.giftCards.getByCode, { code: "TIES" }),
	).toMatchObject({ balance: 0.78 });
	expect(await f.client.query(api.giftCards.list, {})).toMatchObject([
		{ balance: 0.78 },
	]);
	expect(
		await f.client.query(api.giftCards.listByDateRange, range),
	).toMatchObject([{ balance: 0.78 }]);
});

test("reassignment resolves the new technician's rate and payroll groups remain separate", async () => {
	const f = await fixture();
	await f.t.run((ctx) =>
		ctx.db.insert("staffRoles", {
			userId: f.other,
			role: "technician",
			payRate: 0.6,
			isActive: true,
			updatedAt: date,
		}),
	);
	await f.client.mutation(api.transactions.addTransaction, { body: f.body });
	const [tx] = await f.client.query(api.transactions.listByDateRange, range);
	await f.client.mutation(api.transactions.updateTransaction, {
		id: tx._id,
		body: { ...f.body, technicianId: f.other },
	});
	await f.client.mutation(api.transactions.addTransaction, {
		body: { ...f.body, compensation: "40", tip: "0" },
	});
	const payroll = await f.client.query(api.users.usersByDateRange, {
		...range,
		report: true,
	});
	expect(payroll).toHaveLength(2);
	expect(payroll).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ _id: f.other, compensation: 60, tip: 20 }),
			expect.objectContaining({ _id: f.technician, compensation: 20, tip: 0 }),
		]),
	);
});

test("payroll rounds after aggregation rather than rounding each commission", async () => {
	const f = await fixture();
	for (let i = 0; i < 3; i++)
		await f.client.mutation(api.transactions.addTransaction, {
			body: { ...f.body, compensation: "0.03", tip: "0" },
		});
	// 3 * $0.03 at 50% = $0.045, rounded once to $0.05.
	expect(
		await f.client.query(api.users.usersByDateRange, {
			...range,
			report: true,
		}),
	).toMatchObject([{ compensation: 0.05, tip: 0 }]);
	expect(await f.client.query(api.users.usersByDateRange, range)).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				_id: f.technician,
				compensation: 0.09,
				tip: 0,
			}),
		]),
	);
});

test.each([
	["0.15", 0.5, 3, 0.23],
	["0.05", 0.7, 1, 0.04],
])(
	"payroll preserves decimal ties for %s at %s over %s services",
	async (amount, rate, count, expected) => {
		const f = await fixture();
		await f.t.run((ctx) => ctx.db.patch(f.role, { payRate: rate }));
		for (let i = 0; i < count; i++)
			await f.client.mutation(api.transactions.addTransaction, {
				body: { ...f.body, compensation: amount, tip: "0" },
			});
		expect(
			await f.client.query(api.users.usersByDateRange, {
				...range,
				report: true,
			}),
		).toMatchObject([{ compensation: expected }]);
	},
);

test.each([
	["1.005", "0", "0", 8.94],
	["0.20", "0.0049", "0", 9.78],
	["0", "0", "1.005", 8.99],
])(
	"gift decimal input service %s supply %s tip %s stays consistent after persistence",
	async (service, supply, tip, balance) => {
		const f = await fixture();
		await f.client.mutation(api.giftCards.create, {
			code: "DECIMAL",
			value: 10,
			sellDate: date,
		});
		await f.client.mutation(api.transactions.addTransaction, {
			body: {
				...f.body,
				compensation: service,
				compensationMethods: ["Gift Card"],
				compInGift: service,
				supply,
				tip,
				tipMethods: ["Gift Card"],
				tipInGift: tip,
				giftCode: "DECIMAL",
			},
		});
		expect(
			await f.client.query(api.giftCards.getByCode, { code: "DECIMAL" }),
		).toMatchObject({ balance });
	},
);

test("create and edit normalize exact gift splits and their totals together", async () => {
	const f = await fixture();
	await f.client.mutation(api.giftCards.create, {
		code: "SPLIT",
		value: 10,
		sellDate: date,
	});
	const body = {
		...f.body,
		compensation: "1.005",
		compensationMethods: ["Gift Card"],
		compInGift: "1.005",
		tip: "1.005",
		tipMethods: ["Gift Card"],
		tipInGift: "1.005",
		giftCode: "SPLIT",
	};
	await f.client.mutation(api.transactions.addTransaction, { body });
	const [tx] = await f.client.query(api.transactions.listByDateRange, range);
	expect(tx).toMatchObject({
		compensation: 1.01,
		compInGift: 1.01,
		tip: 1.01,
		tipInGift: 1.01,
	});
	await f.client.mutation(api.transactions.updateTransaction, {
		id: tx._id,
		body: { ...body, compensation: "2.675", compInGift: "2.675" },
	});
	expect(
		await f.client.query(api.transactions.listByDateRange, range),
	).toMatchObject([
		{ compensation: 2.68, compInGift: 2.68, tip: 1.01, tipInGift: 1.01 },
	]);
	// $2.68 * 1.05 rounds to $2.81; plus $1.01 untaxed tip.
	expect(
		await f.client.query(api.giftCards.getByCode, { code: "SPLIT" }),
	).toMatchObject({ balance: 6.18 });
});
