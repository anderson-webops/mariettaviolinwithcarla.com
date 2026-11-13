import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import siteContent from "../src/content/site.json";

test("Nuxt resolves its declared unimport API without a provenance downgrade", () => {
	const frontend = createRequire(path.resolve(import.meta.dirname, "../package.json"));
	const nuxt = createRequire(frontend.resolve("nuxt/package.json"));
	const semver = nuxt("semver");
	const metadata = nuxt("./package.json");
	const provider = JSON.parse(readFileSync(path.resolve(path.dirname(nuxt.resolve("unimport")), "../package.json"), "utf8"));
	assert.equal(metadata.dependencies.unimport, "^7.0.2");
	assert.ok(semver.satisfies(provider.version, metadata.dependencies.unimport), `${metadata.name} requires ${metadata.dependencies.unimport}, resolved ${provider.version}`);
	assert.ok(semver.gte(provider.version, "7.0.2"));
});

test("nuxt config points to src and keeps the expected module set", async () => {
	const { default: config } = await import("../nuxt.config.ts");

	assert.equal(config.srcDir, "src");
	assert.deepEqual(
		config.modules?.sort(),
		[
			"@nuxt/eslint",
			"@nuxtjs/color-mode",
			"@pinia/nuxt",
			"@unocss/nuxt"
		].sort()
	);
	assert.equal(config.experimental?.payloadExtraction, true);
	assert.deepEqual(config.vite?.build?.modulePreload, { polyfill: false });
	assert.equal(config.colorMode?.preference, siteContent.settings.colorModeDefault);
	const expectedFallback
		= siteContent.settings.colorModeDefault === "system"
			? "light"
			: siteContent.settings.colorModeDefault;
	assert.equal(config.colorMode?.fallback, expectedFallback);
});
