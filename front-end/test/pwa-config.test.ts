import assert from "node:assert/strict";
import test from "node:test";
import { pwa } from "~/config/pwa.ts";
import { appDescription, appName } from "~/constants";

test("pwa manifest uses app metadata and scope", () => {
	assert.equal(pwa.scope, "/");
	assert.equal(pwa.base, "/");
	assert.equal(pwa.manifest?.name, appName);
	assert.equal(pwa.manifest?.short_name, appName);
	assert.equal(pwa.manifest?.description, appDescription);
});

test("pwa workbox fallback keeps root reachable", () => {
	assert.equal(pwa.workbox?.navigateFallback, "/");
	assert.ok(pwa.workbox?.globPatterns?.includes("**/*.{js,css,html,txt,png,ico,svg}"));
});
