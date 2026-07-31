import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : path.join(path.dirname(process.execPath), "npm");
const result = spawnSync(npmCommand, ["ls", "--all", "--json"], {
	cwd: repositoryRoot,
	encoding: "utf8",
	maxBuffer: 128 * 1024 * 1024
});

assert.ok(result.stdout, `npm ls did not return a dependency graph: ${result.stderr}`);
const tree = JSON.parse(result.stdout);
const unexpected = new Set();
const tolerated = new Set();

function inspectDependency(name, node) {
	if (node.missing) unexpected.add(`missing ${name}: ${node.missing}`);
	if (node.extraneous) unexpected.add(`extraneous ${name}`);
	if (node.invalid) {
		const sourceMatch = String(node.invalid).match(/^"(.+)" from (node_modules\/.+)$/);
		const requesterPath = sourceMatch?.[2];
		if (requesterPath?.endsWith("/@bomb.sh/tab") && (name === "cac" || name === "commander")) {
			const requester = JSON.parse(
				readFileSync(path.join(repositoryRoot, requesterPath, "package.json"), "utf8")
			);
			const expectedRange = requester.peerDependencies?.[name];
			const optional = requester.peerDependenciesMeta?.[name]?.optional === true;
			if (optional && expectedRange === sourceMatch[1]) {
				tolerated.add(`${name} optional adapter for @bomb.sh/tab`);
			}
			else {
				unexpected.add(`invalid ${name}: ${node.invalid}`);
			}
		}
		else {
			unexpected.add(`invalid ${name}: ${node.invalid}`);
		}
	}

	for (const [dependency, child] of Object.entries(node.dependencies || {})) {
		inspectDependency(dependency, child);
	}
}

inspectDependency(tree.name || "root", tree);

const topLevelProblems = tree.problems || [];
for (const problem of topLevelProblems) {
	if (
		!/^invalid: (?:cac|commander)@/.test(problem)
		|| ![...tolerated].some(entry => problem.includes(entry.split(" ")[0]))
	) {
		unexpected.add(problem);
	}
}

assert.deepEqual([...unexpected], [], `Dependency graph problems:\n${[...unexpected].join("\n")}`);
if (tolerated.size) {
	process.stdout.write(
		`Verified dependency graph; npm's ${tolerated.size} known optional CLI-adapter peer mismatches are non-runtime and explicitly checked.\n`
	);
}
else {
	assert.equal(result.status, 0, result.stderr);
	process.stdout.write("Verified dependency graph with no npm problems.\n");
}
