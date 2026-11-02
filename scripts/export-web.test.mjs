import assert from "node:assert/strict";
import { test } from "node:test";
import { validateDeploymentUrl } from "./export-web.mjs";

test("deployable export refuses absent, synthetic and unsafe destinations", () => {
	for (const value of [
		undefined,
		"https://example.convex.cloud",
		"http://127.0.0.1:33210",
		"https://user:secret@salon-test-123.convex.cloud",
		"https://salon-test-123.convex.cloud/path",
	]) {
		assert.throws(() => validateDeploymentUrl(value));
	}
});
test("explicit Convex deployment URL is normalized", () => {
	assert.equal(
		validateDeploymentUrl("https://salon-test-123.convex.cloud/"),
		"https://salon-test-123.convex.cloud",
	);
});
