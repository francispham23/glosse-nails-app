module.exports = {
	preset: "jest-expo",
	watchman: false,
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	testMatch: ["<rootDir>/__tests__/**/*.test.tsx"],
};
