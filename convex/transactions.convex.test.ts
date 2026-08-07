/**
 * Convex integration test — official `convex/test` shape.
 *
 * NOTE: This file is excluded from the default `vitest` run (see
 * `vitest.config.ts`). It runs via the Convex CLI test runner:
 *
 *     npx convex dev        # provisions/connects a deployment (needs CONVEX_DEPLOYMENT)
 *     npm run test:convex   # `convex test` — executes *.convex.test.ts
 *
 * The `convex/test` module is injected by the Convex CLI at test time, so it
 * is NOT resolvable under plain `tsc`/`vitest`. An ambient declaration in
 * `convex-test.d.ts` keeps `tsc --noEmit` green.
 *
 * Best-practice pattern (per docs.convex.dev/testing):
 *  - `Rename(api, { ... })` exposes a real function under a test-only name so
 *    `t.run` can invoke it as if it were the test's own function.
 *  - `fakeUser(ctx, {...})` seeds an authenticated user inside the test txn.
 *  - `requireAnyRole`/`requireActor` enforce auth the same as production.
 */
import { test, expect, Rename, fakeUser } from "convex/test";
import { api } from "./_generated/api";

test("owner can create a gift card and it is listed", async ({ t }) => {
	const asOwner = Rename(api, { giftCards: { create: api.giftCards.create } });
	const owner = await t.run(async (ctx) => {
		return await fakeUser(ctx, {
			role: "owner",
			name: "Owner",
		});
	});

	const giftCardId = await asOwner.giftCards.create({
		code: "TEST-001",
		value: 100,
		sellDate: Date.now(),
	});

	expect(typeof giftCardId).toBe("string");

	const listed = await t.run(async (ctx) => {
		const cards = await ctx.db.query("giftCards").collect();
		return cards.find((c) => c._id === giftCardId);
	});
	expect(listed).toBeDefined();
	expect(listed?.code).toBe("TEST-001");
	expect(listed?.value).toBe(100);
});

test("technician is forbidden from creating a gift card", async ({ t }) => {
	const asTech = Rename(api, { giftCards: { create: api.giftCards.create } });
	await t.run(async (ctx) => {
		await fakeUser(ctx, { role: "technician", name: "Tech" });
	});

	await expect(
		asTech.giftCards.create({
			code: "TEST-002",
			value: 50,
			sellDate: Date.now(),
		}),
	).rejects.toThrow();
});

test("addTransaction links to a gift card and updates transactionIds", async ({
	t,
}) => {
	const asManager = Rename(api, {
		transactions: { add: api.transactions.add },
		giftCards: { create: api.giftCards.create },
	});

	const ctxData = await t.run(async (ctx) => {
		const owner = await fakeUser(ctx, { role: "owner", name: "Owner" });
		const tech = await fakeUser(ctx, { role: "technician", name: "Tech" });
		const card = await ctx.db.insert("giftCards", {
			code: "LINK-001",
			value: 200,
			sellDate: Date.now(),
			transactionIds: [],
		});
		return { owner, tech, card };
	});

	const txId = await asManager.transactions.add({
		compensation: "100",
		compensationMethods: ["Card"],
		tip: "10",
		tipMethods: ["Card"],
		technicianId: ctxData.tech,
		serviceDate: Date.now(),
		giftCode: ctxData.card,
		compInGift: "20",
	});

	expect(typeof txId).toBe("string");

	const updated = await t.run(async (ctx) => {
		return await ctx.db.get(ctxData.card);
	});
	expect(updated?.transactionIds).toContain(txId);
});
