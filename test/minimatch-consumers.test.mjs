import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { Linter } from "eslint";
import importPlugin from "eslint-plugin-import-x";
import handler from "serve-handler";

const require = createRequire(import.meta.url);
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
	});
}

test("serve-handler applies globbed response headers with patched minimatch", async () => {
	const publicRoot = await mkdtemp(join(tmpdir(), "marietta-serve-handler-"));
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
