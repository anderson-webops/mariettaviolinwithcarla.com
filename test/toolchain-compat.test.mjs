import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

test("CI restores only locked downloads without invoking an unqualified npm during Node setup", () => {
	const workflow = readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8");
	assert.doesNotMatch(workflow, /cache:\s*npm/u);
	assert.equal((workflow.match(/package-manager-cache: false/gu) || []).length, 4);
	assert.equal((workflow.match(/actions\/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9/gu) || []).length, 4);
	assert.equal((workflow.match(/hashFiles\('package-lock.json', 'build-toolchain\/package-lock.json', 'vendor\/unimport\/build\/package-lock.json', 'vendor\/unimport\/runtime\/package-lock.json'\)/gu) || []).length, 4);
	assert.equal((workflow.match(/run: bash scripts\/prepare-unimport-source.sh/gu) || []).length, 4);
	assert.match(workflow, /path: \$\{\{ env.NPM_CONFIG_CACHE \}\}\/_cacache/u);
	assert.doesNotMatch(workflow, /path:.*(?:node_modules|_site-toolchains)/u);
});

test("direct and Netlify builds prepare the signed-source provider before the frozen app install", () => {
	const direct = readFileSync(path.join(root, "deploy/direct/prepare-static-release.sh"), "utf8");
	const reviewed = readFileSync(path.join(root, "scripts/build-reviewed-static.sh"), "utf8");
	const netlify = readFileSync(path.join(root, "netlify.toml"), "utf8");
	assert.match(direct, /npm run prepare:unimport-source\nnpm ci --include=dev --include=optional --strict-allow-scripts/u);
	assert.match(reviewed, /bash scripts\/prepare-unimport-source.sh\nnpm ci --include=optional --strict-allow-scripts/u);
	assert.match(netlify, /command = "node scripts\/build-toolchain.mjs -- bash scripts\/build-reviewed-static.sh"/u);
});

test("the selected npm and child commands use the independently locked build profile", () => {
	const entrypoint = realpathSync(process.env.npm_execpath);
	const require = createRequire(path.resolve(path.dirname(entrypoint), "../package.json"));
	const metadata = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
	assert.equal(metadata.packageManager, "npm@12.2.2");
	assert.equal(require("./package.json").version, "12.2.2");
	assert.equal(require("glob/package.json").version, "14.0.4");
	assert.equal(require("minimatch/package.json").version, "11.0.5");
	assert.equal(execFileSync(process.execPath, [entrypoint, "--version"], { encoding: "utf8" }).trim(), "12.2.2");
	assert.equal(execFileSync(process.platform === "win32"
		? "npm.cmd"
		: "npm", ["--version"], { encoding: "utf8" }).trim(), "12.2.2");
});

test("the selected npm Agent retains function-valued TLS validation without a network request", async () => {
	const entrypoint = realpathSync(process.env.npm_execpath);
	const require = createRequire(path.resolve(path.dirname(entrypoint), "../package.json"));
	const { Agent } = require("undici");
	const checkServerIdentity = () => new Error("synthetic certificate rejection");
	const rejected = new Error("synthetic transport stopped before connection");
	const failures = [];
	const agent = new Agent({
		tls: { checkServerIdentity },
		factory(_origin, options) {
			assert.equal(options.tls?.checkServerIdentity, checkServerIdentity);
			throw rejected;
		}
	});
	try {
		try {
			agent.dispatch({ origin: "https://registry.invalid", path: "/", method: "GET" }, {
				onError(error) { failures.push(error); }
			});
		}
		catch (error) { failures.push(error); }
		assert.deepEqual(failures, [rejected]);
	}
	finally { await agent.close(); }
});

test("Vue and ESLint retain the supported TypeScript compiler API", () => {
	const require = createRequire(path.join(root, "front-end/package.json"));
	assert.equal(typeof require("typescript").createProgram, "function");
	assert.equal(typeof require("typescript").createSourceFile, "function");
	assert.match(require("typescript").version, /^6\./u);
});
