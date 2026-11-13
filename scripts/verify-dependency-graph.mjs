import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { selectedNpmCli, verifyBuildToolchain } from "./build-toolchain-state.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = selectedNpmCli();
verifyBuildToolchain(npmCommand);
const result = spawnSync(process.execPath, [npmCommand, "ls", "--all", "--json"], {
	cwd: repositoryRoot,
	encoding: "utf8",
	maxBuffer: 128 * 1024 * 1024
});
assert.equal(result.error, undefined);
assert.ok(result.stdout, `npm ls did not return a dependency graph: ${result.stderr}`);
const tree = JSON.parse(result.stdout);
const problems = new Set(tree.problems || []);

function inspectDependency(name, dependency) {
	for (const field of ["missing", "extraneous", "invalid"]) {
		if (dependency[field]) problems.add(`${field} ${name}: ${dependency[field]}`);
	}
	for (const [childName, child] of Object.entries(dependency.dependencies || {}))
		inspectDependency(childName, child);
}
inspectDependency(tree.name || "root", tree);
assert.deepEqual([...problems], [], `Dependency graph problems:\n${[...problems].join("\n")}`);
assert.equal(result.status, 0, result.stderr);
process.stdout.write("Verified the complete installed dependency graph with no npm problems.\n");
