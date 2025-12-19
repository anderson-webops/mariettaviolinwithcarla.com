import assert from "node:assert/strict";
import test from "node:test";
import siteContent from "../src/content/site.json";

test("nuxt config points to src/ and disables pwa unless enabled", async () => {
	const { default: config } = await import("../nuxt.config.ts");

	assert.equal(config.srcDir, "src");
	assert.deepEqual(
		config.modules?.sort(),
		["@nuxt/eslint", "@nuxtjs/color-mode", "@pinia/nuxt", "@unocss/nuxt", "@vueuse/nuxt"].sort()
	);
	assert.equal((config.pwa as { disable?: boolean }).disable, true);
	assert.equal(config.colorMode?.preference, siteContent.settings.colorModeDefault);
	const expectedFallback =
		siteContent.settings.colorModeDefault === "system" ? "light" : siteContent.settings.colorModeDefault;
	assert.equal(config.colorMode?.fallback, expectedFallback);
});
