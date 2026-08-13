import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

function readJson(pathname) {
	return JSON.parse(readFileSync(pathname, "utf8"));
}

test("the application has no local identity, role, database, or serverless backend surface", () => {
	const rootPackage = readJson("package.json");
	const frontendPackage = readJson("front-end/package.json");

	assert.deepEqual(rootPackage.workspaces, ["front-end"]);
	assert.equal(existsSync("back-end/package.json"), false);
	assert.equal(existsSync("netlify/functions/healthz.mjs"), false);
	assert.equal(existsSync("front-end/server/api/healthz.get.ts"), false);
	assert.equal(existsSync("front-end/server/routes/sitemap.xml.ts"), false);
	assert.equal(frontendPackage.dependencies.express, undefined);
	assert.equal(frontendPackage.dependencies.mongoose, undefined);
});

test("the lesson request is bounded and discloses its third-party processor", () => {
	const site = readJson("front-end/src/content/site.json");

	assert.match(site.contactForm.action, /^https:\/\/usebasin\.com\//);
	assert.match(site.contactForm.privacyNote, /Basin/);
	assert.ok(site.contactForm.fields.every(field => Number.isInteger(field.maxLength) && field.maxLength > 0));
	assert.ok(site.contactForm.fields.find(field => field.name === "email")?.maxLength <= 254);
	assert.ok(site.contactForm.fields.find(field => field.name === "message")?.maxLength <= 2000);
});

test("the optional content editor cannot rewrite protected form settings or repository structure", () => {
	const cmsConfig = readFileSync(".pages.yml", "utf8");
	const editorWorkflow = readFileSync(".github/workflows/content-editor-check.yml", "utf8");

	assert.match(cmsConfig, /path: front-end\/src\/content\/site\.json/);
	assert.match(cmsConfig, /merge: true/);
	assert.match(cmsConfig, /identity: app/);
	assert.match(cmsConfig, /create: false/);
	assert.match(cmsConfig, /rename: false/);
	assert.match(cmsConfig, /delete: false/);
	assert.doesNotMatch(cmsConfig, /name: contactForm/);
	assert.match(editorWorkflow, /permissions:\n {2}contents: read/);
	assert.doesNotMatch(editorWorkflow, /contents: write|pull-requests: write/);
});
