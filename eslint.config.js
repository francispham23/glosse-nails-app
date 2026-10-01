// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
	expoConfig.map((config) =>
		config.files?.includes("**/*.ts")
			? { ...config, files: [...config.files, "**/*.mts", "**/*.cts"] }
			: config,
	),
	{
		ignores: [
			"dist/**",
			".expo/**",
			"convex/_generated/**",
			".agents/**",
			".cursor/**",
		],
	},
]);
