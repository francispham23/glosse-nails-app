// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const path = require("path");

const config = withNativeWind(getDefaultConfig(__dirname), {
	input: "./global.css",
	configPath: "./tailwind.config.js",
});

config.resolver.unstable_enablePackageExports = true;

config.resolver.disableHierarchicalLookup = false;

// Explicitly map gorhom packages to the top-level node_modules directory so
// Metro can resolve them when libraries declare them as peerDependencies.
config.resolver.extraNodeModules = Object.assign(
	{},
	config.resolver.extraNodeModules || {},
	{
		"@gorhom/bottom-sheet": path.resolve(
			__dirname,
			"node_modules/@gorhom/bottom-sheet",
		),
		"@gorhom/portal": path.resolve(__dirname, "node_modules/@gorhom/portal"),
	},
);

module.exports = config;
