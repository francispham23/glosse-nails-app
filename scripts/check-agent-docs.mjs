import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Read-only check of the canonical workflow and compatibility entry points.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
	"AGENTS.md",
	"README.md",
	"docs/agent-workflow.md",
	"docs/financial-policy.md",
	"docs/tasks/template.md",
	".agents/skills/grill-with-docs/SKILL.md",
	".agents/skills/glosse-task/SKILL.md",
	".agents/skills/glosse-task/references/review.md",
	".cursor/skills/glosse-task/SKILL.md",
	".cursor/agents/glosse-implementer.md",
	".cursor/agents/glosse-reviewer.md",
	".cursor/rules/task-workflow.mdc",
	"CLAUDE.md",
];
const { scripts } = JSON.parse(
	readFileSync(resolve(root, "package.json"), "utf8"),
);
const errors = [];
let links = 0;
let commands = 0;
for (const file of files) {
	const path = resolve(root, file);
	if (!existsSync(path)) {
		errors.push(`${file}: missing document`);
		continue;
	}
	const text = readFileSync(path, "utf8");
	for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
		const target = match[1].split("#")[0];
		if (!target || /^[a-z][a-z\d+.-]*:/i.test(target)) continue;
		links++;
		if (!existsSync(resolve(dirname(path), target))) {
			errors.push(`${file}: broken local link ${target}`);
		}
	}
	// Command examples use literal script names; never execute documentation.
	for (const match of text.matchAll(/npm run ([\w:-]+)/g)) {
		commands++;
		if (!Object.hasOwn(scripts, match[1]))
			errors.push(`${file}: unknown npm script ${match[1]}`);
	}
}
if (errors.length) {
	console.error(errors.join("\n"));
	process.exitCode = 1;
} else {
	console.log(
		`Agent docs: ${files.length} files, ${links} local links and ${commands} npm command references passed.`,
	);
}
