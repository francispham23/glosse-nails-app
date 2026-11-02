import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const api = anyApi;
const internal = anyApi;

// Emit only to a disposable checkout; never deploy these helpers to a shared backend.
const fixtureSource = String.raw`import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const configureRoles = internalMutation({
 args: { runId: v.string(), users: v.array(v.id("users")) }, returns: v.null(),
 handler: async (ctx, { runId, users }) => {
  if (runId !== process.env.RUNTIME_TEST_RUN_ID || users.length !== 4) throw new Error("Wrong runtime fixture");
  for (const [index,id] of users.entries()) {
   const user = await ctx.db.get(id);
   if (!user?.email?.startsWith(runId + "-") || !user.email.endsWith("@example.invalid")) throw new Error("Not a task-owned account");
   const existing = await ctx.db.query("staffRoles").withIndex("by_userId", q => q.eq("userId", id)).unique();
   if (existing) throw new Error("Fixture roles already exist");
   await ctx.db.patch(id, { name: "Runtime " + index });
   await ctx.db.insert("staffRoles", { userId: id, role: index === 0 ? "manager" : "technician", payRate: 0.5, isActive: index !== 3, updatedAt: Date.now() });
  }
  return null;
 }
});
export const snapshot = internalQuery({
 args: { runId: v.string() }, returns: v.any(),
 handler: async (ctx, { runId }) => {
  if (runId !== process.env.RUNTIME_TEST_RUN_ID) throw new Error("Wrong runtime fixture");
  // The isolated database must remain small enough for complete rollback comparison.
  if ((await ctx.db.query("transactions").take(101)).length > 100 || (await ctx.db.query("giftCards").take(101)).length > 100) throw new Error("Fixture limit exceeded");
  return { transactions: await ctx.db.query("transactions").take(100), cards: await ctx.db.query("giftCards").take(100) };
 }
});
`;
if (process.argv[2] === "--fixture-source") {
	process.stdout.write(fixtureSource);
	process.exit(0);
}
const path = process.argv[2];
if (!path) throw new Error("Supply the task-owned local credentials JSON path");
assert.equal(
	(await stat(path)).mode & 0o077,
	0,
	"Credentials file must be private (chmod 600)",
);
const config = JSON.parse(await readFile(path, "utf8"));
const url = new URL(config.url);
assert.equal(url.protocol, "http:");
assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.port, "33210");
assert.equal(url.pathname, "/");
assert.equal(url.username + url.password + url.search + url.hash, "");
assert.match(config.runId, /^runtime-[a-z0-9-]+$/);
const admin = new ConvexHttpClient(config.url);
admin.setAdminAuth(config.adminKey);
const snapshot = () =>
	admin.query(internal.runtimeFixtures.snapshot, { runId: config.runId });
assert.deepEqual(await snapshot(), { transactions: [], cards: [] });
const actors = [];
const clients = [];
for (let i = 0; i < 4; i++) {
	const email = `${config.runId}-${i}@example.invalid`;
	const password = randomBytes(24).toString("base64url");
	const client = new ConvexHttpClient(config.url);
	const result = await client.action(api.auth.signIn, {
		provider: "password",
		params: { flow: "signUp", email, password },
	});
	assert.ok(result.tokens?.token, "Password sign-up must issue a token");
	client.setAuth(result.tokens.token);
	const access = await client.query(api.users.viewerAccess, {});
	assert.ok(
		access.authenticated && access.user?._id,
		"Token must authenticate a real user",
	);
	clients.push(client);
	actors.push({
		email,
		password,
		token: result.tokens.token,
		userId: access.user._id,
	});
}
await admin.mutation(internal.runtimeFixtures.configureRoles, {
	runId: config.runId,
	users: actors.map((actor) => actor.userId),
});
for (const [i, client] of clients.entries()) {
	const access = await client.query(api.users.viewerAccess, {});
	assert.equal(access.role, i === 0 ? "manager" : "technician");
	assert.equal(access.isActive, i !== 3);
}
// Retained only in private scratch storage for interactive browser/native checks.
await writeFile(path, JSON.stringify({ ...config, actors }), { mode: 0o600 });
const [manager, first, second, inactive] = clients;
const date = Date.now();
const range = { startDate: date - 1000, endDate: date + 1000 };
let sequence = 0;
const card = (value) =>
	manager.mutation(api.giftCards.create, {
		code: `${config.runId}-card-${sequence++}`,
		value,
		sellDate: date,
	});
const code = async (id) =>
	(await snapshot()).cards.find((item) => item._id === id).code;
const quote = async (id) =>
	manager.query(api.giftCards.getByCode, { code: await code(id) });
const body = async (id, technicianId, gift = "50") => ({
	technicianId,
	serviceDate: date,
	compensation: "100",
	compensationMethods: ["Card", "Gift Card"],
	compInGift: gift,
	giftCode: await code(id),
	tip: "0",
	tipMethods: [],
});
const add = (client, body) =>
	client.mutation(api.transactions.addTransaction, { body });
const unchangedAfterRejection = async (operation, expectedError) => {
	const before = await snapshot();
	await assert.rejects(operation, expectedError);
	assert.deepEqual(
		await snapshot(),
		before,
		"Rejected request changed stored financial state",
	);
};
const exact = await card(105);
await add(first, await body(exact, actors[1].userId));
assert.equal((await quote(exact)).balance, 52.5);
await add(second, await body(exact, actors[2].userId));
assert.equal((await quote(exact)).balance, 0);
assert.equal((await quote(exact)).transactionIds.length, 2);
await unchangedAfterRejection(
	async () => add(first, await body(exact, actors[1].userId, "0.01")),
	/Insufficient gift card balance/,
);
await unchangedAfterRejection(
	async () =>
		add(new ConvexHttpClient(config.url), await body(exact, actors[1].userId)),
	/Please sign in to continue/,
);
await unchangedAfterRejection(
	async () => add(inactive, await body(exact, actors[3].userId)),
	/Your account is inactive/,
);
console.log(
	"PASS authenticated round trip, shared exact balance, excess, anonymous and inactive denial",
);

for (let round = 0; round < 10; round++) {
	const id = await card(52.5);
	const requests = [
		await body(id, actors[1].userId),
		await body(id, actors[2].userId),
	];
	const results = await Promise.allSettled([
		add(first, requests[0]),
		add(second, requests[1]),
	]);
	assert.equal(
		results.filter((result) => result.status === "fulfilled").length,
		1,
	);
	const rejected = results.find((result) => result.status === "rejected");
	assert.match(String(rejected.reason), /Insufficient gift card balance/);
	const result = await quote(id);
	assert.equal(result.balance, 0);
	assert.equal(result.transactionIds.length, 1);
	assert.equal(
		(await manager.query(api.transactions.listByGiftCard, { giftCardId: id }))
			.length,
		1,
	);
}
console.log(
	"PASS 10 concurrent rounds: one success, one balance denial, one row/reference, zero balance each",
);

const origin = await card(52.5);
const originalBody = await body(origin, actors[1].userId);
await add(first, originalBody);
const tx = (
	await manager.query(api.transactions.listByGiftCard, { giftCardId: origin })
)[0];
const edit = (client, next) =>
	client.mutation(api.transactions.updateTransaction, {
		id: tx._id,
		body: next,
	});
await edit(first, originalBody);
assert.equal((await quote(origin)).balance, 0);
await unchangedAfterRejection(
	() => edit(second, { ...originalBody, technicianId: actors[2].userId }),
	/You do not have permission to access this user/,
);
await unchangedAfterRejection(
	async () =>
		second.query(api.giftCards.getByCode, {
			code: await code(origin),
			transactionId: tx._id,
		}),
	/You do not have permission to access this user/,
);
await unchangedAfterRejection(
	() => edit(first, { ...originalBody, compInGift: "50.01" }),
	/Insufficient gift card balance/,
);
const small = await card(52.49);
await unchangedAfterRejection(
	async () => edit(first, { ...originalBody, giftCode: await code(small) }),
	/Insufficient gift card balance/,
);
const destination = await card(100);
await edit(first, { ...originalBody, giftCode: await code(destination) });
assert.equal((await quote(origin)).balance, 52.5);
assert.equal((await quote(destination)).balance, 47.5);
assert.equal((await quote(origin)).transactionIds.length, 0);
assert.deepEqual((await quote(destination)).transactionIds, [tx._id]);
await edit(first, {
	...originalBody,
	compensationMethods: ["Card"],
	compInGift: "",
	giftCode: "",
});
assert.equal((await quote(destination)).balance, 100);
assert.equal((await quote(destination)).transactionIds.length, 0);
await manager.mutation(api.transactions.deleteTransaction, { id: tx._id });
const deletion = await card(100);
await add(first, await body(deletion, actors[1].userId));
const toDelete = (
	await manager.query(api.transactions.listByGiftCard, { giftCardId: deletion })
)[0];
await manager.mutation(api.transactions.deleteTransaction, {
	id: toDelete._id,
});
assert.equal((await quote(deletion)).balance, 100);
assert.equal((await quote(deletion)).transactionIds.length, 0);
assert.ok(
	(await manager.query(api.transactions.listByDateRange, range)).length > 0,
);
console.log(
	"PASS ownership, same-card exclusion, rejected edit/switch rollback, successful switch/removal/delete",
);
console.log(
	"Backend runtime cases passed. Internal OCC retry counts were not observed. Browser/native cases are separate.",
);
