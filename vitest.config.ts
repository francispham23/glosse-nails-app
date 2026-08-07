import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
	test: {
		environment: "node",
		// Run the pure-logic unit tests. Convex integration tests
		// (`*.convex.test.ts`) require the Convex CLI runner (`npm run test:convex`)
		// against a live deployment and are intentionally excluded here.
		include: ["**/*.test.ts"],
		exclude: ["**/node_modules/**", "convex/**/*.convex.test.ts"],
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL(".", import.meta.url)),
		},
	},
});
