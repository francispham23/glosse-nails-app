/// <reference types="vite/client" />
import {
	invalidateSessions,
	modifyAccountCredentials,
	retrieveAccount,
} from "@convex-dev/auth/server";
import { convexTest } from "convex-test";
import { beforeEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

// Simulate the credential provider; identity parsing and action logic stay real.
vi.mock("@convex-dev/auth/server", async (importOriginal) => ({
	...(await importOriginal<typeof import("@convex-dev/auth/server")>()),
	retrieveAccount: vi.fn(),
	modifyAccountCredentials: vi.fn(),
	invalidateSessions: vi.fn(),
}));
const modules = import.meta.glob([
	"./**/*.ts",
	"./_generated/*.js",
	"!./**/*.test.ts",
	"!./**/*.d.ts",
]);
const args = {
	email: "staff@example.test",
	oldPassword: "old-password",
	newPassword: "new-password",
};
beforeEach(() => vi.resetAllMocks());

async function fixture() {
	const t = convexTest(schema, modules);
	const [caller, other] = await t.run(async (ctx) => [
		await ctx.db.insert("users", { email: args.email }),
		await ctx.db.insert("users", { email: "other@example.test" }),
	]);
	return { t, caller, other };
}

test("anonymous password change never contacts the credential provider", async () => {
	const { t } = await fixture();
	await expect(t.action(api.users.changePassword, args)).rejects.toThrow();
	expect(retrieveAccount).not.toHaveBeenCalled();
	expect(modifyAccountCredentials).not.toHaveBeenCalled();
});

test("knowing another account's password does not authorize changing it", async () => {
	const { t, caller, other } = await fixture();
	vi.mocked(retrieveAccount).mockResolvedValue({
		user: { _id: other },
		account: {},
	} as Awaited<ReturnType<typeof retrieveAccount>>);
	await expect(
		t.withIdentity({ subject: caller }).action(api.users.changePassword, args),
	).rejects.toThrow("own password");
	expect(modifyAccountCredentials).not.toHaveBeenCalled();
	expect(invalidateSessions).not.toHaveBeenCalled();
});

test("the account owner can change a password and invalidate their other sessions", async () => {
	const { t, caller } = await fixture();
	vi.mocked(retrieveAccount).mockResolvedValue({
		user: { _id: caller },
		account: {},
	} as Awaited<ReturnType<typeof retrieveAccount>>);
	await expect(
		t.withIdentity({ subject: caller }).action(api.users.changePassword, args),
	).resolves.toEqual({ success: true });
	expect(modifyAccountCredentials).toHaveBeenCalledWith(expect.anything(), {
		provider: "password",
		account: { id: args.email, secret: args.newPassword },
	});
	expect(invalidateSessions).toHaveBeenCalledWith(expect.anything(), {
		userId: caller,
		except: undefined,
	});
});
