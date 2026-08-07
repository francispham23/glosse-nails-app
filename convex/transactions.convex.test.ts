/**
 * Convex integration test — official `convex/test` shape.
 *
 * NOTE: This file is excluded from the default `vitest` run (see
 * `vitest.config.ts`) and from `tsc`/`eslint` (see `tsconfig.json` /
 * `eslint.config.js`). It runs via the Convex CLI test runner:
 *
 *     npx convex dev        # provisions/connects a deployment (needs CONVEX_DEPLOYMENT)
 *     npm run test:convex   # `convex test` — executes *.convex.test.ts
 *
 * The `convex/test` module is injected by the Convex CLI at test time, so it
 * is NOT resolvable under plain `tsc`/`vitest`.
 *
 * IMPORTANT — auth model: this app grants roles via a `staffRoles` table, not a
 * field on the auth user. `fakeUser(ctx, {...})` only creates the auth user;
 * the test must ALSO insert a `staffRoles` record (with `isActive: true`) to
 * satisfy `requireActor`/`requireAnyRole`. Otherwise every role check throws
 * `FORBIDDEN / missing_role` and the assertions below would be meaningless.
 *
 * Best-practice pattern (per docs.convex.dev/testing):
 *  - `Rename(api, { ... })` exposes a real function under a test-only name so
 *    `t.run` can invoke it as if it were the test's own function.
 *  - `fakeUser(ctx, {...})` seeds an authenticated user inside the test txn and
 *    returns its id.
 */
import { test, expect, Rename, fakeUser } from "convex/test";
import { api } from "./_generated/api";

// Seed a staff role so requireActor/requireAnyRole succeed for `userId`.
async function seedStaffRole(
	ctx: any,
	userId: string,
	role: "owner" | "manager" | "technician",
) {
	await ctx.db.insert("staffRoles", {
		userId: userId as any,
		role,
		isActive: true,
		updatedAt: Date.now(),
	});
}

test("owner can create a gift card and it is listed", async ({ t }) => {
	const asOwner = Rename(api, { giftCards: { create: api.giftCards.create } });

	const ownerId = await t.run(async (ctx) => {
		const id = await fakeUser(ctx, { name: "Owner" });
		await seedStaffRole(ctx, id, "owner");
		return id;
	});
	expect(typeof ownerId).toBe("string");

	const giftCardId = await asOwner.giftCards.create({
		code: "TEST-001",
		value: 100,
		sellDate: Date.now(),
	});
	expect(typeof giftCardId).toBe("string");

	const created = await t.run(async (ctx) => {
		return await ctx.db.get(giftCardId as any);
	});
	expect(created).toBeDefined();
	expect((created as any).code).toBe("TEST-001");
	expect((created as any).value).toBe(100);
});

test("technician is forbidden from creating a gift card", async ({ t }) => {
	const asTech = Rename(api, { giftCards: { create: api.giftCards.create } });

	await t.run(async (ctx) => {
		const id = await fakeUser(ctx, { name: "Tech" });
		await seedStaffRole(ctx, id, "technician");
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
		transactions: { add: api.transactions.addTransaction },
		giftCards: { create: api.giftCards.create },
	});

	// Seed an owner (to create the gift card) and a technician (the txn's tech).
	const { techId, cardId } = await t.run(async (ctx) => {
		const owner = await fakeUser(ctx, { name: "Owner" });
		await seedStaffRole(ctx, owner, "owner");
		const tech = await fakeUser(ctx, { name: "Tech" });
		await seedStaffRole(ctx, tech, "technician");
		const card = await ctx.db.insert("giftCards", {
			code: "LINK-001",
			value: 200,
			sellDate: Date.now(),
			transactionIds: [],
		});
		return { techId: tech, cardId: card };
	});

	// addTransaction expects a `body` object and links by gift-card CODE.
	const txId = await asManager.transactions.addTransaction({
		body: {
			compensation: "100",
			compensationMethods: ["Card"],
			tip: "10",
			tipMethods: ["Card"],
			technicianId: techId as any,
			serviceDate: Date.now(),
			giftCode: "LINK-001",
			compInGift: "20",
		},
	});
	expect(typeof txId).toBe("string");

	const updated = await t.run(async (ctx) => {
		return await ctx.db.get(cardId as any);
	});
	expect((updated as any).transactionIds).toContain(txId);
});
