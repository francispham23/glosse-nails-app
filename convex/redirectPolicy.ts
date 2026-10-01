type RedirectConfig = {
	allowedSchemes?: string;
	expoScheme?: string;
	allowedOrigins?: string;
	siteUrl?: string;
	allowDevelopment?: boolean;
	developmentOrigins?: string;
};

const entries = (value?: string) =>
	(value ?? "")
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

function parseUrl(value: string): URL | null {
	// Reject normalization surprises and credentials before comparing origins.
	if (
		[...value].some(
			(char) =>
				char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127 || char === "\\",
		)
	)
		return null;
	try {
		const url = new URL(value);
		return url.username || url.password ? null : url;
	} catch {
		return null;
	}
}

export function resolveRedirect(
	redirectTo: string,
	config: RedirectConfig,
): string {
	const site = config.siteUrl ? parseUrl(config.siteUrl) : null;
	const relative = redirectTo.startsWith("/") && !redirectTo.startsWith("//");
	const candidate =
		relative && site ? `${site.origin}${redirectTo}` : redirectTo;
	const url = parseUrl(candidate);
	if (url) {
		if (url.protocol === "https:") {
			const origins = entries(config.allowedOrigins).map(parseUrl);
			if (site?.protocol === "https:") origins.push(site);
			if (
				origins.some(
					(origin) =>
						origin?.protocol === "https:" && origin.origin === url.origin,
				)
			)
				return candidate;
		}

		const developmentProtocol =
			url.protocol === "exp:" ||
			url.protocol === "exps:" ||
			(url.protocol === "http:" &&
				["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
		if (config.allowDevelopment && developmentProtocol) {
			const allowed = entries(config.developmentOrigins).map(parseUrl);
			if (
				allowed.some(
					(origin) =>
						origin &&
						origin.protocol === url.protocol &&
						origin.host === url.host,
				)
			)
				return candidate;
		}

		const reserved = [
			"http:",
			"https:",
			"exp:",
			"exps:",
			"javascript:",
			"data:",
			"file:",
			"blob:",
			"about:",
		];
		const schemes = entries(config.allowedSchemes);
		if (schemes.length === 0 && config.expoScheme)
			schemes.push(config.expoScheme.trim());
		if (
			!reserved.includes(url.protocol) &&
			schemes.some(
				(scheme) =>
					/^[a-z][a-z0-9+.-]*$/i.test(scheme) &&
					url.protocol === `${scheme.toLowerCase()}:`,
			) &&
			candidate.toLowerCase().startsWith(`${url.protocol}//`)
		)
			return candidate;
	}

	// Do not echo a URI that can contain an OAuth code or other sensitive input.
	throw new Error(
		"Invalid redirectTo URI. Configure exact web origins or the app's native scheme on the Convex deployment.",
	);
}
