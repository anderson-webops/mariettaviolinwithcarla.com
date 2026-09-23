import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateContentTransition } from "../scripts/verify-content-pr.mjs";

const path = "front-end/src/content/site.json";
const valid = JSON.parse(readFileSync(path, "utf8"));
const changedFiles = [{ filename: path, status: "modified" }];

test("routine content can change through the dedicated content branch", () => {
	const proposed = structuredClone(valid);
	proposed.hero.body = "Updated public studio introduction.";
	assert.equal(validateContentTransition(valid, proposed, changedFiles).hero.body, proposed.hero.body);
});

test("the content branch cannot redirect the protected form destination", () => {
	const proposed = structuredClone(valid);
	proposed.contactForm.action = "https://usebasin.com/f/another-account";
	assert.throws(() => validateContentTransition(valid, proposed, changedFiles));
});

test("the content branch cannot change protected navigation destinations", () => {
	const proposed = structuredClone(valid);
	proposed.announcement.ctaHref = "/other";
	assert.throws(() => validateContentTransition(valid, proposed, changedFiles));
});

test("the content branch cannot change repository code or add files", () => {
	assert.throws(() =>
		validateContentTransition(valid, structuredClone(valid), [
			...changedFiles,
			{ filename: "front-end/nuxt.config.ts", status: "modified" }
		]));
});
