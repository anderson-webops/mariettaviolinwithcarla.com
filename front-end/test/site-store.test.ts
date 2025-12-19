import assert from "node:assert/strict";
import test from "node:test";
import { createPinia, setActivePinia } from "pinia";
import { useSiteStore } from "@/stores/site.ts";
import siteContent from "../src/content/site.json";

test("site store exposes content and normalized color mode default", () => {
	setActivePinia(createPinia());
	const store = useSiteStore();

	assert.equal(store.site.name, siteContent.site.name);
	assert.equal(store.contact.email, siteContent.contact.email);

	const expectedColor = ["dark", "system"].includes(siteContent.settings.colorModeDefault)
		? siteContent.settings.colorModeDefault
		: "light";
	assert.equal(store.colorModeDefault, expectedColor);
});

test("contact form fields are present and email is required", () => {
	setActivePinia(createPinia());
	const store = useSiteStore();

	assert.ok(store.contactForm.fields.length > 0);
	assert.ok(store.contactForm.fields.some((field) => field.name === "email" && field.required));
	assert.equal(store.contactForm.submitLabel.length > 0, true);
});
