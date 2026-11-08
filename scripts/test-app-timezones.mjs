import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const jest = require.resolve("jest/bin/jest");
const failures = [];

// Separate processes ensure Jest and imported date libraries see TZ at startup.
for (const timezone of ["UTC", "America/Vancouver", "Asia/Tokyo"]) {
	console.log(`\nRunning app tests with TZ=${timezone}`);
	const result = spawnSync(
		process.execPath,
		[jest, "--runInBand", ...process.argv.slice(2)],
		{ env: { ...process.env, TZ: timezone }, stdio: "inherit" },
	);
	if (result.error) console.error(result.error.message);
	if (result.status !== 0) failures.push(timezone);
}

if (failures.length) {
	console.error(`App tests failed in: ${failures.join(", ")}`);
	process.exitCode = 1;
}
