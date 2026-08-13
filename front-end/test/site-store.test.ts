import assert from "node:assert/strict";
import test from "node:test";
import { createPinia, setActivePinia } from "pinia";
import { telephoneHref, useSiteStore } from "@/stores/site.ts";
import siteContent from "../src/content/site.json";

test("site store exposes content and normalized color mode default", () => {
	setActivePinia(createPinia());
	const store = useSiteStore();

	assert.equal(store.site.name, siteContent.site.name);
	assert.equal(store.contact.email, siteContent.contact.email);
	assert.equal(store.contact.phoneHref, "tel:+17705680161");
	assert.equal(store.students.support[0], `${siteContent.students.locationLabel} — ${siteContent.hero.location}`);

	const expectedColor = ["dark", "system"].includes(siteContent.settings.colorModeDefault)
		? siteContent.settings.colorModeDefault
		: "light";
	assert.equal(store.colorModeDefault, expectedColor);
});

test("telephone links are derived from the editor-friendly display number", () => {
	assert.equal(telephoneHref("770-568-0161"), "tel:+17705680161");
	assert.equal(telephoneHref("1 (770) 568-0161"), "tel:+17705680161");
});

test("contact form fields are present and email is required", () => {
	setActivePinia(createPinia());
	const store = useSiteStore();

	assert.ok(store.contactForm.fields.length > 0);
	assert.ok(store.contactForm.fields.some((field) => field.name === "email" && field.required));
	assert.ok(store.contactForm.fields.every((field) => field.maxLength > 0));
	assert.match(store.contactForm.privacyNote, /Basin/);
	assert.equal(store.contactForm.submitLabel.length > 0, true);
});
