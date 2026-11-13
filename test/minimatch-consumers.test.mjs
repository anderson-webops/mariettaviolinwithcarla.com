import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { Linter } from "eslint";
import importPlugin from "eslint-plugin-import-x";
import handler from "serve-handler";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("..", import.meta.url));
const reviewedMatcherFiles = [
	"node_modules/eslint-plugin-import-x/lib/rules/no-internal-modules.js",
	"node_modules/eslint-plugin-import-x/lib/index.cjs"
];
const plugins = [
	["esm", importPlugin],
	[
		"commonjs",
		require("eslint-plugin-import-x")
	],
];

for (const [name, plugin] of plugins) {
	test(`${name} import rule preserves allowed and forbidden glob behavior`, () => {
		const linter = new Linter();
		const config = options => [
			{
				plugins: { "import-x": plugin },
				languageOptions: { ecmaVersion: "latest", sourceType: "module" },
				rules: {
					"import-x/no-internal-modules": ["error", options]
				},
			}
		];
		const source = "import value from '../vendor/tests/braces-compat.test.mjs'";
		const check = options => linter.verify(source, config(options), { filename: "test/fixture.js" });
		assert.equal(check({
			allow: ["vendor/tests/**"]
		}).length, 0);
		assert.equal(check({
			allow: ["other/**"]
		}).length, 1);
		assert.equal(check({
			forbid: ["vendor/tests/**"]
		}).length, 1);
		assert.equal(check({
			forbid: ["other/**"]
		}).length, 0);
		assert.equal(check({
			allow: ["vendor/{tests,private}/**"]
		}).length, 0);
		assert.equal(check({
			forbid: ["vendor/{tests,private}/**"]
		}).length, 1);
		assert.equal(check({
			allow: ["vendor/@(tests|fixtures)/**"]
		}).length, 0);
		assert.equal(check({
			forbid: ["!vendor/tests/**"]
		}).length, 1);
		assert.equal(check({
			forbid: ["!**/vendor/tests/**"]
		}).length, 0);
		assert.equal(check({
			forbid: ["!**/other/**"]
		}).length, 1);
		assert.equal(check({
			allow: ["!**/other/**"]
		}).length, 0);
	});
}

test("compatibility preparation preserves the reviewed upstream matchers exactly", async () => {
	const original = await Promise.all(reviewedMatcherFiles.map(filename => readFile(join(root, filename))));
	const result = spawnSync(process.execPath, [
		join(root, "scripts/patch-minimatch-consumers.mjs")
	], {
		cwd: root,
		encoding: "utf8"
	});
	assert.equal(result.status, 0, result.stderr);
	assert.deepEqual(await Promise.all(reviewedMatcherFiles.map(filename => readFile(join(root, filename)))), original);
});

test("compatibility preparation rejects changed matcher bytes without rewriting them", async (context) => {
	const parent = join(root, ".ai-work/runs");
	await mkdir(parent, { recursive: true });
	const directory = await mkdtemp(join(parent, "matcher-integrity-"));
	context.after(() => rm(directory, { recursive: true, force: true }));
	for (const relative of ["scripts/patch-minimatch-consumers.mjs", "node_modules/serve-handler/src/index.js", ...reviewedMatcherFiles]) {
		const destination = join(directory, relative);
		await mkdir(dirname(destination), { recursive: true });
		await writeFile(destination, await readFile(join(root, relative)));
	}
	const invoke = () => spawnSync(process.execPath, [
		join(directory, "scripts/patch-minimatch-consumers.mjs")
	], {
		cwd: directory,
		encoding: "utf8"
	});
	const pristine = invoke();
	assert.equal(pristine.status, 0, pristine.stderr);
	const destination = join(directory, reviewedMatcherFiles[0]);
	const changed = Buffer.concat([
		await readFile(destination),
		Buffer.from("\nvoid 0;\n")
	]);
	await writeFile(destination, changed);
	const rejected = invoke();
	assert.equal(rejected.status, 1);
	assert.match(rejected.stderr, /Unexpected installed dependency bytes: node_modules\/eslint-plugin-import-x\/lib\/rules\/no-internal-modules.js/);
	assert.deepEqual(await readFile(destination), changed);
});

test("serve-handler applies globbed response headers with patched minimatch", async () => {
	const parent = join(root, ".ai-work/runs");
	await mkdir(parent, { recursive: true });
	const publicRoot = await mkdtemp(join(parent, "marietta-serve-handler-"));
	await writeFile(join(publicRoot, "index.html"), "<h1>fixture</h1>");
	const server = createServer((request, response) => handler(request, response, {
		public: publicRoot,
		headers: [
			{
				source: "**/*.html",
				headers: [
					{ key: "X-Compat", value: "passed" }
				]
			}
		],
	}));
	try {
		await new Promise(resolveServer => server.listen(0, "127.0.0.1", resolveServer));
		const response = await fetch(`http://127.0.0.1:${server.address().port}/index.html`);
		assert.equal(response.status, 200);
		assert.equal(response.headers.get("x-compat"), "passed");
		assert.match(await response.text(), /fixture/);
	}
	finally {
		await new Promise(resolveServer => server.close(resolveServer));
		await rm(publicRoot, { recursive: true, force: true });
	}
});
