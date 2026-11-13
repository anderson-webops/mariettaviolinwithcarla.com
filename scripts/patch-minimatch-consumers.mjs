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
		sha256: "e9725a2253f98d1cf60799a6b81bc9314d0598989ffbba9bc75b53fdccff9adb",
		patchedSha256: "e9725a2253f98d1cf60799a6b81bc9314d0598989ffbba9bc75b53fdccff9adb",
		replacements: [],
	},
	{
		path: "node_modules/eslint-plugin-import-x/lib/index.cjs",
		sha256: "fa3a68959b53af85852a5ce2d4f825e22e7ea1bdb3189fc84b8946bad97d5dd9",
		patchedSha256: "fa3a68959b53af85852a5ce2d4f825e22e7ea1bdb3189fc84b8946bad97d5dd9",
		replacements: [],
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
