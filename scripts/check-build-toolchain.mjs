import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import process from "node:process";
import { verifyBuildToolchain } from "./build-toolchain-state.mjs";

const receipt = verifyBuildToolchain();
for (const filename of ["package.json", "front-end/package.json"]) {
	const manifest = JSON.parse(readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"));
	assert.equal(manifest.packageManager, `npm@${receipt.versions.npm}`);
	assert.equal(manifest.engines.node, `>=${receipt.node} <27`);
}
for (const filename of [".node-version", ".nvmrc"])
	assert.equal(readFileSync(new URL(`../${filename}`, import.meta.url), "utf8").trim(), receipt.node);
process.stdout.write(`${JSON.stringify(receipt)}\n`);
