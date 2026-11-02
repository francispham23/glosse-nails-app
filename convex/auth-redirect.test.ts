import { convexAuth } from "@convex-dev/auth/server";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import "./auth";

// Capture only framework registration; execute the application's real callback.
vi.mock("@convex-dev/auth/server", () => ({ convexAuth: vi.fn(() => ({})) }));

const callback = vi.mocked(convexAuth).mock.calls[0]?.[0]?.callbacks?.redirect;

if (!callback) {
	throw new Error("convexAuth redirect callback is not registered");
}

const redirect = (redirectTo: string) => callback({ redirectTo });

beforeEach(() => {
	vi.stubEnv("ALLOWED_REDIRECT_SCHEMES", "glossenailapp");
	vi.stubEnv("EXPO_SCHEME", "");
	vi.stubEnv(
		"ALLOWED_REDIRECT_ORIGINS",
		"https://salon.example,https://auth.expo.io",
	);
	vi.stubEnv("SITE_URL", "https://salon.example");
	vi.stubEnv("ALLOW_DEVELOPMENT_REDIRECTS", "false");
	vi.stubEnv("DEVELOPMENT_REDIRECT_ORIGINS", "");
});
afterEach(() => vi.unstubAllEnvs());

test.each([
	"https://auth.expo.io.attacker.invalid/callback",
	"http://localhost.attacker.invalid/callback",
	"http://localhost:8081/callback",
	"exp://192.0.2.1:8081/--/callback",
	"https://salon.example.attacker.invalid/callback",
	"https://salon.example@attacker.invalid/callback",
	"https://attacker@salon.example/callback",
	"javascript:alert(1)",
	"glossenailapp://user:password@callback",
	"glossenailapp://callback\n",
	"glossenailapp://callback\\evil",
	"//attacker.invalid/callback",
])("rejects unsafe or unconfigured callback %s", async (uri) => {
	await expect(redirect(uri)).rejects.toThrow();
});

test.each([
	"glossenailapp://callback?code=test",
	"https://salon.example/callback",
	"https://auth.expo.io/@test/app",
])("allows configured callback %s", async (uri) => {
	await expect(redirect(uri)).resolves.toBe(uri);
});

test("a web scheme in the native allowlist cannot permit arbitrary hosts", async () => {
	vi.stubEnv("ALLOWED_REDIRECT_SCHEMES", "https,http,exp");
	await expect(redirect("https://attacker.invalid/callback")).rejects.toThrow();
	await expect(redirect("exp://attacker.invalid/callback")).rejects.toThrow();
});

test("development callbacks require opt-in and an exact configured origin", async () => {
	vi.stubEnv("ALLOW_DEVELOPMENT_REDIRECTS", "true");
	vi.stubEnv(
		"DEVELOPMENT_REDIRECT_ORIGINS",
		"http://localhost:8081,exp://192.0.2.1:8081",
	);
	await expect(redirect("http://localhost:8081/callback")).resolves.toBe(
		"http://localhost:8081/callback",
	);
	await expect(redirect("exp://192.0.2.1:8081/--/callback")).resolves.toBe(
		"exp://192.0.2.1:8081/--/callback",
	);
	await expect(redirect("http://localhost:9090/callback")).rejects.toThrow();
	await expect(
		redirect("exp://attacker.invalid/--/callback"),
	).rejects.toThrow();
});

test("EXPO_SCHEME fallback and SITE_URL relative redirects work without broad defaults", async () => {
	vi.stubEnv("ALLOWED_REDIRECT_SCHEMES", "");
	vi.stubEnv("EXPO_SCHEME", "glossenailapp");
	await expect(redirect("glossenailapp://callback")).resolves.toBe(
		"glossenailapp://callback",
	);
	await expect(redirect("/callback")).resolves.toBe(
		"https://salon.example/callback",
	);
	vi.stubEnv("EXPO_SCHEME", "");
	await expect(redirect("glossenailapp://callback")).rejects.toThrow();
});
