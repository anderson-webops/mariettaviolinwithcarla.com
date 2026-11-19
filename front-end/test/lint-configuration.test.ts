import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { ESLint } from "eslint";

const frontend = path.resolve(import.meta.dirname, "..");

function severity(rule: unknown) {
	return Array.isArray(rule)
		? rule[0]
		: rule;
}

test("one formatter owns source layout while the new upstream checks remain enabled", async () => {
	const eslint = new ESLint({ cwd: frontend });
	for (const filename of ["nuxt.config.ts", "src/components/DarkToggle.vue"]) {
		const config = await eslint.calculateConfigForFile(path.join(frontend, filename));
		assert.equal(severity(config.rules["antfu/reasonable-newline"]), 2);
		assert.equal(severity(config.rules["slop/no-em-dash"]), 2);
		assert.notEqual(severity(config.rules["prettier/prettier"]), 2);
	}
});

test("HTML, XML and embedded CSS use valid language parsers without skipping prose checks", async () => {
	const eslint = new ESLint({ cwd: frontend });
	for (const [filename, content] of [
		["public/404.html", "<!doctype html><main>Readable prose</main>\n"],
		["public/sitemap.xml", "<?xml version=\"1.0\"?><root/>\n"],
		["src/app.vue/0_0.css", "#__nuxt { min-height: 100vh; }\n"]
	] as const) {
		const results = await eslint.lintText(content, {
			filePath: path.join(frontend, filename)
		});
		assert.equal(results.length, 1);
		const [result] = results;
		assert.ok(result);
		assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
	}
	const [result] = await eslint.lintText(`<main>Readable ${String.fromCharCode(0x2014)} prose</main>\n`, {
		filePath: path.join(frontend, "public/404.html")
	});
	assert.ok(result?.messages.some(message => message.ruleId === "slop/no-em-dash"));
});
