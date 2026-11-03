import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const patches = [
	{
		path: "node_modules/serve-handler/src/index.js",
		sha256: "7a73329a5c0119909f35da1636ac7610d80e219bd13274ef441b3415397d59ba",
		patchedSha256: "10b910fb2d6a0a380ab674e061dd0cb8273e888a69b105c2cc269492abae6582",
		replacements: [
			["const minimatch = require('minimatch');", "const {minimatch} = require('minimatch');"],
		],
	},
	{
		path: "node_modules/eslint-plugin-import-x/lib/rules/no-internal-modules.js",
		sha256: "e8e65c1449e1ade45229001595b08f33fc879c4673e0c9be9013dd1df87acd21",
		patchedSha256: "c4466222b36a8281cf18e3f22a2a44940529a44ad3a257b5294299034a153195",
		replacements: [
			["import { makeRe } from 'minimatch';", "import { minimatch } from 'minimatch';"],
			["const allowRegexps = (options.allow || [])\n            .map(p => makeRe(p))\n            .filter(Boolean);", "const allowGlobs = options.allow || [];"],
			["const forbidRegexps = (options.forbid || [])\n            .map(p => makeRe(p))\n            .filter(Boolean);", "const forbidGlobs = options.forbid || [];"],
			["return allowRegexps.some(re => re.test(importPath));", "return allowGlobs.some(pattern => minimatch(importPath, pattern));"],
			["return forbidRegexps.some(re => re.test(importPath));", "return forbidGlobs.some(pattern => minimatch(importPath, pattern));"],
		],
	},
	{
		path: "node_modules/eslint-plugin-import-x/lib/index.cjs",
		sha256: "0d09a1c49ba7f3ec5030e246f81075ee5630cf216429e1db1ea7829bf4c52357",
		patchedSha256: "2ff4487b45a63f6fd2bcaeca9519ea601df505f3587bdf1e88c7f922828d5560",
		replacements: [
			["const allowRegexps = (options.allow || []).map((p) => (0, minimatch.makeRe)(p)).filter(Boolean);", "const allowGlobs = options.allow || [];"],
			["const forbidRegexps = (options.forbid || []).map((p) => (0, minimatch.makeRe)(p)).filter(Boolean);", "const forbidGlobs = options.forbid || [];"],
			["return allowRegexps.some((re) => re.test(importPath));", "return allowGlobs.some((pattern) => (0, minimatch.minimatch)(importPath, pattern));"],
			["return forbidRegexps.some((re) => re.test(importPath));", "return forbidGlobs.some((pattern) => (0, minimatch.minimatch)(importPath, pattern));"],
		],
	},
];

for (const patch of patches) {
	const path = join(root, patch.path);
	const source = await readFile(path, "utf8");
	const digest = createHash("sha256").update(source).digest("hex");
	if (digest === patch.patchedSha256) continue;
	if (digest !== patch.sha256) throw new Error(`Unexpected installed dependency bytes: ${patch.path}`);
	let updated = source;
	for (const [before, after] of patch.replacements) {
		if (updated.split(before).length !== 2) throw new Error(`Patch anchor changed: ${patch.path}`);
		updated = updated.replace(before, after);
	}
	if (createHash("sha256").update(updated).digest("hex") !== patch.patchedSha256) {
		throw new Error(`Patched dependency digest mismatch: ${patch.path}`);
	}
	await writeFile(path, updated);
	console.log(`Applied Node 26 compatibility patch: ${patch.path}`);
}
