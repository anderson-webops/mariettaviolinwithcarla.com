import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { assertGeneratedTrackerMatchesSource } from "../scripts/static-output-integrity.mjs";
import { assertNoRetiredEnvironmentFiles } from "../scripts/verify-no-retired-secrets.mjs";

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

test("the content workflow runs trusted base code with read-only permissions", () => {
	const contentWorkflow = readFileSync(".github/workflows/content-change-policy.yml", "utf8");

	assert.equal(existsSync(".pages.yml"), false);
	assert.equal(existsSync(".github/workflows/content-editor-check.yml"), false);
	assert.match(contentWorkflow, /pull_request_target:/);
	assert.match(contentWorkflow, /permissions:\n {2}contents: read\n {2}pull-requests: read/);
	assert.match(contentWorkflow, /ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
	assert.match(contentWorkflow, /persist-credentials: false/);
	assert.doesNotMatch(contentWorkflow, /pull_request\.head\.repo|checkout.*head|contents: write|pull-requests: write/);
});

test("retired backend secret verification rejects nested environment files without following links", async (context) => {
	const fixtureRoot = await mkdtemp(path.join(tmpdir(), "carla-retired-backend-"));
	context.after(() => rm(fixtureRoot, { force: true, recursive: true }));
	const nestedDirectory = path.join(fixtureRoot, "src", "models", "plugins");
	await mkdir(nestedDirectory, { recursive: true });

	await assert.doesNotReject(assertNoRetiredEnvironmentFiles(fixtureRoot));

	const nestedEnvironment = path.join(nestedDirectory, ".env.production");
	await writeFile(nestedEnvironment, "SYNTHETIC_TEST_VALUE=not-a-secret\n", "utf8");
	await assert.rejects(
		assertNoRetiredEnvironmentFiles(fixtureRoot),
		/Retired backend environment material is present/
	);
	await rm(nestedEnvironment);

	await symlink(path.join(fixtureRoot, "outside"), path.join(nestedDirectory, "linked-material"));
	await assert.rejects(assertNoRetiredEnvironmentFiles(fixtureRoot), /must not contain symbolic links/);
});

test("generated analytics must exactly match the reviewed vendored tracker", () => {
	const reviewedTracker = Buffer.from("reviewed analytics tracker bytes");
	const matchingTracker = Buffer.from(reviewedTracker);
	const modifiedTracker = Buffer.concat([reviewedTracker, Buffer.from(";unexpected-build-mutation")]);

	assert.doesNotThrow(() => assertGeneratedTrackerMatchesSource(reviewedTracker, matchingTracker));
	assert.throws(
		() => assertGeneratedTrackerMatchesSource(reviewedTracker, modifiedTracker),
		/must exactly match the reviewed vendored source/
	);
});
