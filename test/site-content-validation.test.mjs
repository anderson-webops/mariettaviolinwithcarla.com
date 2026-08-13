import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
	SITE_CONTENT_PATH,
	SiteContentValidationError,
	validateSiteContent
} from "../scripts/validate-site-content.mjs";

const validContent = JSON.parse(readFileSync(SITE_CONTENT_PATH, "utf8"));

function copyContent() {
	return structuredClone(validContent);
}

function assertInvalid(update, expectedPath) {
	const content = copyContent();
	update(content);
	assert.throws(
		() => validateSiteContent(content),
		error => error instanceof SiteContentValidationError && error.message.includes(expectedPath)
	);
}

test("the checked-in site content satisfies the editor contract", () => {
	assert.equal(validateSiteContent(copyContent()).site.name, validContent.site.name);
});

test("unknown keys are rejected instead of silently disappearing", () => {
	assertInvalid((content) => {
		content.contact.phoneHref = "tel:+17705680161";
	}, "contact");
});

test("contact details must remain usable", () => {
	assertInvalid((content) => {
		content.contact.email = "not-an-email";
	}, "contact.email");
	assertInvalid((content) => {
		content.contact.phoneDisplay = "555";
	}, "contact.phoneDisplay");
	assertInvalid((content) => {
		content.contact.phoneDisplay = "call 770-568-0161";
	}, "contact.phoneDisplay");
});

test("navigation links must stay within the static site", () => {
	assertInvalid((content) => {
		content.announcement.ctaHref = "https://example.com";
	}, "announcement.ctaHref");
	assertInvalid((content) => {
		content.announcement.ctaHref = "//example.com";
	}, "announcement.ctaHref");
});

test("the Basin endpoint, disclosure, and field limits are protected", () => {
	assertInvalid((content) => {
		content.contactForm.action = "https://example.com/form";
	}, "contactForm.action");
	assertInvalid((content) => {
		content.contactForm.privacyNote = "Submit the form.";
	}, "contactForm.privacyNote");
	assertInvalid((content) => {
		content.contactForm.fields[2].maxLength = 20_000;
	}, "contactForm.fields[2].maxLength");
});
