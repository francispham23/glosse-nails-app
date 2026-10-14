import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function validateDeploymentUrl(value) {
	if (!value)
		throw new Error("Pass --convex-url=<intended deployment URL> explicitly.");
	const url = new URL(value);
	if (
		url.protocol !== "https:" ||
		!/^[a-z][a-z0-9-]*-\d+\.convex\.cloud$/.test(url.hostname) ||
		url.username ||
		url.password ||
		url.port ||
		url.pathname !== "/" ||
		url.search ||
		url.hash
	)
		throw new Error(
			"Deployable exports require a real HTTPS Convex cloud deployment, not a verification placeholder.",
		);
	return url.origin;
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	try {
		const args = process.argv.slice(2);
		const url = validateDeploymentUrl(
			args.find((arg) => arg.startsWith("--convex-url="))?.slice(13),
		);
		const output =
			args.find((arg) => arg.startsWith("--output-dir="))?.slice(13) || "dist";
		if (
			args.some(
				(arg) =>
					!arg.startsWith("--convex-url=") && !arg.startsWith("--output-dir="),
			)
		)
			throw new Error("Use --convex-url=URL and optional --output-dir=PATH.");
		const result = spawnSync(
			"npx",
			[
				"expo",
				"export",
				"--platform",
				"web",
				"--output-dir",
				output,
				"--max-workers",
				"2",
			],
			{
				stdio: "inherit",
				env: {
					...process.env,
					EXPO_NO_DOTENV: "1",
					EXPO_PUBLIC_CONVEX_URL: url,
				},
			},
		);
		if (result.error) throw result.error;
		process.exitCode = result.status ?? 1;
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
