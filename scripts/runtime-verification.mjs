import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { execFileSync, spawn } from "node:child_process";
import { createHash, generateKeyPairSync, randomBytes } from "node:crypto";
import { closeSync, openSync } from "node:fs";
import {
	chmod,
	copyFile,
	lstat,
	mkdir,
	mkdtemp,
	readFile,
	realpath,
	rm,
	symlink,
	writeFile,
} from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { anyApi, makeFunctionReference } from "convex/server";

const api = anyApi;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PIN = "precompiled-2026-09-28-5c7cb5b";
const ZIP_SHA =
	"c1613bb4a3ac884871184020662c865a045cde95ad781fff002a6bd25f2f2890";
const BINARY_SHA =
	"c6290f5a86bc2f6b31a931833c25106ccc06c0c8c9f0894c35f2d7cecf1fd676";
const URLS = {
	api: "http://127.0.0.1:33210",
	site: "http://127.0.0.1:33211",
	app: "http://localhost:33212",
};
const PORTS = [33210, 33211, 33212];
const hash = (value) => createHash("sha256").update(value).digest("hex");
const pause = () => new Promise((done) => setTimeout(done, 200));
const env = {
	PATH: process.env.PATH,
	HOME: process.env.HOME,
	TMPDIR: process.env.TMPDIR,
	CI: "1",
	EXPO_NO_DOTENV: "1",
	EXPO_NO_TELEMETRY: "1",
	EXPO_OFFLINE: "1",
	CONVEX_DISABLE_TELEMETRY: "1",
};
const ctl = (name) => makeFunctionReference(`runtimeControl:${name}`);
const snapRef = makeFunctionReference("runtimeFixtures:snapshot");
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const save = (path, value) =>
	writeFile(path, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
const git = (args) =>
	execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

function productFiles() {
	return git(["ls-files", "--cached", "--others", "--exclude-standard"])
		.split("\n")
		.filter(
			(p) =>
				/^(app|components|contexts|hooks|constants|utils|assets|convex)\//.test(
					p,
				) ||
				/^(package(-lock)?\.json|app\.json|metro\.config\.js|babel\.config\.js|tsconfig\.json|global\.css|uniwind-types\.d\.ts|expo-env\.d\.ts|convex\.json)$/.test(
					p,
				),
		);
}
async function sourceDigest(files, base = ROOT) {
	return hash(
		(
			await Promise.all(
				files
					.filter(
						(p) =>
							!p.startsWith("convex/_generated/") && p !== "uniwind-types.d.ts",
					)
					.map(async (p) => `${p}\0${hash(await readFile(join(base, p)))}`),
			)
		).join("\n"),
	);
}
function identity(pid) {
	try {
		return hash(
			execFileSync(
				"ps",
				["-p", String(pid), "-o", "lstart=", "-o", "command="],
				{ encoding: "utf8" },
			).trim(),
		);
	} catch {
		return null;
	}
}
async function available(port) {
	for (const host of ["127.0.0.1", "::1"]) await availableAt(port, host);
}
async function availableAt(port, host) {
	return new Promise((ok, fail) => {
		const server = createServer();
		server.once("error", fail);
		server.listen({ host, port, exclusive: true }, () => server.close(ok));
	});
}
async function waitFor(check, label) {
	const until = Date.now() + 120_000;
	while (Date.now() < until) {
		if (await check()) return;
		await pause();
	}
	throw new Error(`Timeout: ${label}`);
}
async function get(url) {
	return fetch(url, { signal: AbortSignal.timeout(3000) });
}
async function load(path) {
	assert.equal(
		await realpath(path),
		resolve(path),
		"Manifest symlinks are refused",
	);
	const m = await json(path);
	assert.equal(m.kind, "glosse-runtime-v1");
	assert.match(m.runId, /^runtime-[a-z0-9-]+$/);
	assert.deepEqual(m.urls, URLS, "Wrong target; refusing network access");
	assert.equal(resolve(path), join(m.evidence, "manifest.json"));
	assert.equal(await realpath(m.evidence), m.evidence);
	if (m.state === "closed") return m;
	assert.match(m.scratch, /^\/private\/tmp\/glosse-verify-[a-zA-Z0-9]+$/);
	assert.equal(await realpath(m.scratch), m.scratch);
	assert.deepEqual(await json(join(m.scratch, "owner.json")), {
		runId: m.runId,
		token: m.ownerToken,
	});
	return m;
}
function owned(m, name) {
	const p = m.processes.find((item) => item.name === name);
	assert.ok(
		p && identity(p.pid) === p.identity,
		`${name} missing or stale process identity`,
	);
	return p;
}
async function record(m, name, value) {
	assert.match(name, /^[a-z-]+$/);
	await save(join(m.evidence, name + ".json"), {
		runId: m.runId,
		source: m.source,
		platform: "Expo development web",
		target: m.urls.api,
		...value,
	});
}
async function creds(m) {
	const p = join(m.scratch, "credentials.json");
	assert.equal(
		(await lstat(p)).mode & 0o077,
		0,
		"Private credentials required",
	);
	const c = await json(p);
	assert.equal(c.url, URLS.api);
	assert.equal(c.runId, m.runId);
	return c;
}
async function doctor(m) {
	assert.equal(m.state, "ready", "Run is not ready");
	owned(m, "backend");
	owned(m, "metro");
	assert.deepEqual(
		productFiles(),
		m.files,
		"Source inventory changed; relaunch",
	);
	assert.equal(
		await sourceDigest(m.files),
		m.source,
		"Product source changed; relaunch",
	);
	assert.equal(
		await sourceDigest(m.files, join(m.scratch, "source")),
		m.source,
		"Scratch source changed; relaunch",
	);
	assert.equal(
		hash(await readFile(join(m.scratch, "convex-local-backend"))),
		BINARY_SHA,
	);
	assert.equal(await (await get(URLS.api + "/instance_name")).text(), m.runId);
	assert.deepEqual(
		await (await get(URLS.app + "/runtime-identity.json")).json(),
		{ runId: m.runId, source: m.source, target: URLS.api },
	);
	const c = await creds(m);
	const admin = new ConvexHttpClient(c.url);
	admin.setAdminAuth(c.adminKey);
	assert.deepEqual(await admin.query(ctl("identity"), {}), {
		runId: m.runId,
		source: m.source,
	});
	assert.equal(c.actors.length, 4);
	for (const [i, actor] of c.actors.entries()) {
		assert.equal(actor.email, `${m.runId}-${i}@example.invalid`);
		const client = new ConvexHttpClient(c.url);
		client.setAuth(actor.token);
		const access = await client.query(api.users.viewerAccess, {});
		assert.equal(access.user._id, actor.userId);
		assert.equal(access.isActive, i !== 3);
		assert.equal(access.role, i === 0 ? "manager" : "technician");
	}
	return { c, admin };
}
async function start(m, name, command, args, options = {}) {
	const fd = openSync(join(m.scratch, name + ".log"), "a", 0o600);
	const child = spawn(command, args, {
		cwd: join(m.scratch, "source"),
		env,
		detached: true,
		stdio: ["ignore", fd, fd],
		...options,
	});
	closeSync(fd);
	await new Promise((ok, fail) => {
		child.once("spawn", ok);
		child.once("error", fail);
	});
	const fingerprint = identity(child.pid);
	assert.ok(fingerprint, "Started process exited before registration");
	m.processes.push({ name, pid: child.pid, identity: fingerprint });
	await save(join(m.evidence, "manifest.json"), m);
	child.unref();
}
function command(m, args) {
	try {
		return execFileSync(
			process.execPath,
			[
				join(ROOT, "node_modules/convex/bin/main.js"),
				...args,
				"--env-file",
				join(m.scratch, "target.env"),
			],
			{
				cwd: join(m.scratch, "source"),
				env,
				encoding: "utf8",
				stdio: ["ignore", "pipe", "pipe"],
				timeout: 120_000,
			},
		);
	} catch (error) {
		// Private CLI output can include environment values; keep it in private scratch.
		writeFile(
			join(m.scratch, "cli-error.log"),
			String(error.stderr || "CLI failed"),
			{ mode: 0o600 },
		).catch(() => {});
		throw new Error(
			`Local Convex ${args[0]} failed; private diagnostic: ${join(m.scratch, "cli-error.log")}`,
		);
	}
}
const fixtureExtra = String.raw`
import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
export const identity = internalQuery({ args: {}, returns: v.object({runId:v.string(),source:v.string()}), handler: async () => ({runId:process.env.RUNTIME_TEST_RUN_ID!,source:process.env.RUNTIME_SOURCE!}) });
export const rate = internalMutation({args:{runId:v.string(),userId:v.id("users"),value:v.union(v.literal(-1),v.literal(0.5)),transactionId:v.optional(v.id("transactions"))},returns:v.null(),handler:async(ctx,args)=>{
 if(args.runId!==process.env.RUNTIME_TEST_RUN_ID)throw new Error("Wrong run");
 const user=await ctx.db.get(args.userId);
 if(!user?.email?.startsWith(args.runId+"-")||!user.email.endsWith("@example.invalid"))throw new Error("Foreign actor");
 if(args.transactionId){const t=await ctx.db.get(args.transactionId);if(!t||t.technician!==args.userId)throw new Error("Foreign transaction");await ctx.db.patch(t._id,{payRateSnapshot:args.value});}
 else{const role=await ctx.db.query("staffRoles").withIndex("by_userId",q=>q.eq("userId",args.userId)).unique();if(!role)throw new Error("Missing role");await ctx.db.patch(role._id,{payRate:args.value});}
 return null;
}});
`;
async function launch(evidence) {
	assert.equal(process.platform, "darwin");
	assert.equal(process.arch, "arm64", "Pinned backend is macOS arm64");
	for (const port of PORTS) await available(port);
	const parent = await realpath(dirname(resolve(evidence)));
	const evidencePath = join(parent, resolve(evidence).split("/").pop());
	await mkdir(evidencePath, { mode: 0o700 }); // Exclusive: existing paths are never reused.
	const scratch = await mkdtemp("/private/tmp/glosse-verify-");
	await chmod(scratch, 0o700);
	const m = {
		kind: "glosse-runtime-v1",
		runId: "runtime-" + randomBytes(8).toString("hex"),
		ownerToken: randomBytes(24).toString("hex"),
		evidence: evidencePath,
		scratch,
		urls: URLS,
		files: productFiles(),
		processes: [],
		state: "launching",
		backend: PIN,
	};
	await save(join(scratch, "owner.json"), {
		runId: m.runId,
		token: m.ownerToken,
	});
	await save(join(evidencePath, "manifest.json"), m);
	try {
		m.source = await sourceDigest(m.files);
		await save(join(evidencePath, "manifest.json"), m);
		const source = join(scratch, "source");
		await mkdir(source);
		for (const file of m.files) {
			await mkdir(dirname(join(source, file)), { recursive: true });
			await copyFile(join(ROOT, file), join(source, file));
		}
		await symlink(join(ROOT, "node_modules"), join(source, "node_modules"));
		await mkdir(join(source, "public"));
		await save(join(source, "public/runtime-identity.json"), {
			runId: m.runId,
			source: m.source,
			target: URLS.api,
		});
		const archive = join(scratch, "backend.zip");
		const download = await fetch(
			`https://github.com/get-convex/convex-backend/releases/download/${PIN}/convex-local-backend-aarch64-apple-darwin.zip`,
			{ signal: AbortSignal.timeout(60_000) },
		);
		assert.ok(download.ok, "Official backend download failed");
		const bytes = Buffer.from(await download.arrayBuffer());
		assert.equal(hash(bytes), ZIP_SHA);
		await writeFile(archive, bytes);
		execFileSync("unzip", ["-q", archive, "-d", scratch]);
		const binary = join(scratch, "convex-local-backend");
		assert.equal(hash(await readFile(binary)), BINARY_SHA);
		const secret = randomBytes(32).toString("hex");
		const adminKey = execFileSync(
			binary,
			[
				"keygen",
				"admin-key",
				"--instance-name",
				m.runId,
				"--instance-secret",
				secret,
			],
			{ encoding: "utf8" },
		).trim();
		await save(join(scratch, "credentials.json"), {
			url: URLS.api,
			runId: m.runId,
			adminKey,
		});
		await writeFile(
			join(scratch, "target.env"),
			`CONVEX_SELF_HOSTED_URL=${URLS.api}\nCONVEX_SELF_HOSTED_ADMIN_KEY=${adminKey}\n`,
			{ mode: 0o600 },
		);
		await start(m, "backend", binary, [
			"--interface",
			"127.0.0.1",
			"--port",
			"33210",
			"--site-proxy-port",
			"33211",
			"--convex-origin",
			URLS.api,
			"--convex-site",
			URLS.site,
			"--instance-name",
			m.runId,
			"--instance-secret",
			secret,
			"--disable-beacon",
			"--local-storage",
			join(scratch, "storage"),
			join(scratch, "database.sqlite3"),
		]);
		await waitFor(async () => {
			try {
				return (
					(await (await get(URLS.api + "/instance_name")).text()) === m.runId
				);
			} catch {
				return false;
			}
		}, "backend");
		const { privateKey, publicKey } = generateKeyPairSync("rsa", {
			modulusLength: 2048,
		});
		const jwk = publicKey.export({ format: "jwk" });
		jwk.use = "sig";
		jwk.alg = "RS256";
		jwk.kid = "runtime";
		const variables = {
			JWT_PRIVATE_KEY: privateKey.export({ type: "pkcs8", format: "pem" }),
			JWKS: JSON.stringify({ keys: [jwk] }),
			SITE_URL: URLS.app,
			RUNTIME_TEST_RUN_ID: m.runId,
			RUNTIME_SOURCE: m.source,
		};
		const update = await fetch(URLS.api + "/api/update_environment_variables", {
			method: "POST",
			headers: {
				Authorization: `Convex ${adminKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				changes: Object.entries(variables).map(([name, value]) => ({
					name,
					value,
				})),
			}),
		});
		assert.ok(update.ok, "Isolated environment setup failed");
		await writeFile(
			join(source, "convex/runtimeFixtures.ts"),
			execFileSync(
				process.execPath,
				[join(ROOT, "scripts/runtime-financial-check.mjs"), "--fixture-source"],
				{ encoding: "utf8" },
			),
		);
		await writeFile(join(source, "convex/runtimeControl.ts"), fixtureExtra);
		command(m, ["deploy", "--yes", "--typecheck", "disable"]);
		const harness = execFileSync(
			process.execPath,
			[
				join(ROOT, "scripts/runtime-financial-check.mjs"),
				join(scratch, "credentials.json"),
			],
			{ env, encoding: "utf8", timeout: 120_000 },
		);
		assert.ok(
			harness
				.split("\n")
				.every(
					(line) =>
						!line ||
						line.startsWith("PASS ") ||
						line.startsWith("Backend runtime cases passed."),
				),
			"Unexpected harness output",
		);
		await writeFile(join(evidence, "backend-checks.txt"), harness);
		const actors = (await creds(m)).actors;
		const manager = new ConvexHttpClient(URLS.api);
		manager.setAuth(actors[0].token);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		await manager.mutation(api.shifts.saveShift, {
			technicians: [actors[1].userId],
			shiftDate: today.getTime(),
		});
		await start(
			m,
			"metro",
			process.execPath,
			[
				join(ROOT, "node_modules/expo/bin/cli"),
				"start",
				"--web",
				"--host",
				"localhost",
				"--port",
				"33212",
				"--clear",
			],
			{
				env: {
					...env,
					EXPO_PUBLIC_CONVEX_URL: URLS.api,
					EXPO_ROUTER_APP_ROOT: join(source, "app"),
				},
			},
		);
		await waitFor(async () => {
			try {
				return (await get(URLS.app + "/runtime-identity.json")).ok;
			} catch {
				return false;
			}
		}, "Metro");
		m.state = "ready";
		await save(join(evidence, "manifest.json"), m);
		await doctor(m);
		await record(m, "launch", {
			backend: PIN,
			binarySha256: BINARY_SHA,
			urls: URLS,
		});
		console.log(
			JSON.stringify({
				manifest: join(evidence, "manifest.json"),
				url: URLS.app,
				privateCredentials: join(scratch, "credentials.json"),
				createRoute:
					URLS.app +
					"/technician/" +
					(await creds(m)).actors[1].userId +
					"/create",
			}),
		);
	} catch (error) {
		await cleanup(m);
		throw error;
	}
}
async function cleanup(m) {
	if (m.state === "closed") {
		console.log("Already cleaned; retained evidence unchanged");
		return;
	}
	for (const p of m.processes) {
		const current = identity(p.pid);
		assert.ok(
			current === null || current === p.identity,
			"Stale identity: refusing cleanup",
		);
	}
	for (const p of [...m.processes].reverse()) {
		if (identity(p.pid) === p.identity) process.kill(-p.pid, "SIGTERM");
	}
	await waitFor(
		async () => m.processes.every((p) => identity(p.pid) === null),
		"owned process exit",
	);
	for (const port of PORTS) await available(port);
	assert.deepEqual(await json(join(m.scratch, "owner.json")), {
		runId: m.runId,
		token: m.ownerToken,
	});
	await rm(m.scratch, { recursive: true });
	m.state = "closed";
	await save(join(m.evidence, "manifest.json"), m);
	await record(m, "cleanup", {
		ownedProcessesAbsent: true,
		portsFree: PORTS,
		scratchRemoved: true,
		proofRetained: true,
	});
}
async function fixture(m, stage) {
	const { c, admin } = await doctor(m);
	assert.ok(
		["create-reject", "create-restore", "edit-reject", "edit-restore"].includes(
			stage,
		),
	);
	const args = {
		runId: m.runId,
		userId: c.actors[1].userId,
		value: stage.endsWith("reject") ? -1 : 0.5,
	};
	if (stage.startsWith("edit")) {
		assert.ok(m.transactionId);
		args.transactionId = m.transactionId;
	}
	await admin.mutation(ctl("rate"), args);
	if (stage.endsWith("reject"))
		await save(
			join(m.scratch, "before.json"),
			await admin.query(snapRef, { runId: m.runId }),
		);
	m.stage = stage;
	await save(join(m.evidence, "manifest.json"), m);
	console.log(`Synthetic fixture ${stage}; use real UI to submit`);
}
async function checkpoint(m, stage) {
	const { c, admin } = await doctor(m);
	const state = await admin.query(snapRef, { runId: m.runId });
	const before = await json(join(m.scratch, "before.json"));
	if (["create-rejected", "edit-rejected"].includes(stage)) {
		assert.equal(m.stage, stage.replace("rejected", "reject"));
		assert.deepEqual(state, before, "Rejected request changed stored state");
		await record(m, stage, {
			unchangedStoredState: true,
			transactionCount: state.transactions.length,
		});
	} else {
		assert.ok(["created", "edited"].includes(stage));
		assert.equal(
			m.stage,
			stage === "created" ? "create-restore" : "edit-restore",
		);
		if (stage === "created") {
			assert.equal(state.transactions.length, before.transactions.length + 1);
			const additions = state.transactions.filter(
				(t) => !before.transactions.some((b) => b._id === t._id),
			);
			assert.equal(additions.length, 1);
			m.transactionId = additions[0]._id;
			m.transactionCount = state.transactions.length;
		} else assert.equal(state.transactions.length, m.transactionCount);
		const manager = new ConvexHttpClient(c.url);
		manager.setAuth(c.actors[0].token);
		const t = await manager.query(api.transactions.getById, {
			id: m.transactionId,
		});
		assert.equal(t.technician, c.actors[1].userId);
		assert.equal(t.compensation, stage === "created" ? 125 : 150);
		assert.equal(t.tip, 20);
		assert.equal(t.supply, 2);
		assert.equal(t.discount, 3);
		assert.equal(t.discountType, "Amount");
		assert.equal(t.payRateSnapshot, 0.5);
		await record(m, stage, {
			transactionCount: state.transactions.length,
			charge: t.compensation,
			tip: t.tip,
			supply: t.supply,
			discount: t.discount,
			rate: t.payRateSnapshot,
		});
		await save(join(m.evidence, "manifest.json"), m);
		console.log(
			JSON.stringify({
				stage,
				editRoute: URLS.app + "/transaction/" + m.transactionId + "/edit",
			}),
		);
	}
}
const [operation, path, stage] = process.argv.slice(2);
try {
	if (operation === "launch") {
		assert.ok(path, "Supply a new evidence directory under an existing parent");
		await launch(path);
	} else {
		assert.ok(
			["doctor", "fixture", "checkpoint", "cleanup"].includes(operation),
			"Use launch|doctor|fixture|checkpoint|cleanup",
		);
		const m = await load(path);
		if (operation === "doctor") {
			await doctor(m);
			console.log(
				"PASS owned backend/app/source/auth/fixture identity; no financial mutations",
			);
		}
		if (operation === "fixture") await fixture(m, stage);
		if (operation === "checkpoint") await checkpoint(m, stage);
		if (operation === "cleanup") await cleanup(m);
	}
} catch (error) {
	console.error(
		error instanceof assert.AssertionError
			? `Verification refused: ${error.operator || "assertion"} (${error.message.split("\n")[0]})`
			: error.stdout !== undefined || error.stderr !== undefined
				? "Runtime subprocess failed; private output withheld"
				: error.message,
	);
	process.exitCode = 1;
}
