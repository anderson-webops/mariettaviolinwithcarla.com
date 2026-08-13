import { readFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SITE_CONTENT_PATH = fileURLToPath(new URL("../front-end/src/content/site.json", import.meta.url));

export class SiteContentValidationError extends Error {
	constructor(path, message) {
		super(`Invalid site content at ${path}: ${message}`);
		this.name = "SiteContentValidationError";
	}
}

function fail(path, message) {
	throw new SiteContentValidationError(path, message);
}

function assertObject(value, path, keys) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		fail(path, "expected an object");
	}

	const actualKeys = Object.keys(value);
	const missing = keys.filter(key => !actualKeys.includes(key));
	const unexpected = actualKeys.filter(key => !keys.includes(key));

	if (missing.length > 0) fail(path, `missing ${missing.join(", ")}`);
	if (unexpected.length > 0) fail(path, `unexpected ${unexpected.join(", ")}`);

	return value;
}

function assertString(value, path, { allowBoundaryWhitespace = false, maxLength, pattern } = {}) {
	if (typeof value !== "string") fail(path, "expected text");
	if (value.length === 0) fail(path, "must not be empty");
	if (!allowBoundaryWhitespace && value !== value.trim()) fail(path, "must not start or end with whitespace");
	if (maxLength && value.length > maxLength) fail(path, `must be ${maxLength} characters or fewer`);
	if (/\p{Cc}/u.test(value)) fail(path, "must not contain control characters");
	if (pattern && !pattern.test(value)) fail(path, "has an unsupported format");

	return value;
}

function assertBoolean(value, path) {
	if (typeof value !== "boolean") fail(path, "expected true or false");
}

function assertInteger(value, path, expected) {
	if (!Number.isInteger(value)) fail(path, "expected a whole number");
	if (expected !== undefined && value !== expected) fail(path, `must remain ${expected}`);
}

function assertChoice(value, path, choices) {
	if (!choices.includes(value)) fail(path, `must be one of ${choices.join(", ")}`);
}

function assertArray(value, path, { min, max }) {
	if (!Array.isArray(value)) fail(path, "expected a list");
	if (value.length < min || value.length > max) fail(path, `must contain between ${min} and ${max} items`);

	return value;
}

function assertUnique(values, path) {
	if (new Set(values).size !== values.length) fail(path, "must not contain duplicate items");
}

function containsWhitespace(value) {
	return [...value].some(character => character.trim() === "");
}

function assertEmail(value, path) {
	assertString(value, path, { maxLength: 254 });
	const [localPart, domain, extraPart] = value.split("@");
	if (
		!localPart
		|| !domain
		|| extraPart !== undefined
		|| containsWhitespace(value)
		|| !domain.includes(".")
		|| domain.startsWith(".")
		|| domain.endsWith(".")
	) {
		fail(path, "must be a valid email address");
	}
}

function assertPhone(value, path) {
	assertString(value, path, { maxLength: 30 });
	const allowedCharacters = new Set("0123456789+().- ");
	if ([...value].some(character => !allowedCharacters.has(character))) {
		fail(path, "may contain only digits and common phone-number punctuation");
	}
	const digits = value.replace(/\D/g, "");
	if (!(digits.length === 10 || (digits.length === 11 && digits.startsWith("1")))) {
		fail(path, "must contain a 10-digit US phone number");
	}
}

function assertInternalHref(value, path) {
	assertString(value, path, { maxLength: 160 });
	const [pathname, fragment, extraFragment] = value.split("#");
	if (
		!pathname.startsWith("/")
		|| pathname.startsWith("//")
		|| pathname.includes("?")
		|| containsWhitespace(value)
		|| extraFragment !== undefined
		|| (fragment !== undefined && !/^[a-z][\w-]*$/i.test(fragment))
	) {
		fail(path, "must be a site-relative path or section link");
	}
}

function validateSiteIdentity(site) {
	assertObject(site, "site", ["name", "description", "label"]);
	assertString(site.name, "site.name", { maxLength: 120 });
	assertString(site.description, "site.description", { maxLength: 320 });
	assertString(site.label, "site.label", { maxLength: 80 });
}

function validateSettings(settings) {
	assertObject(settings, "settings", ["colorModeDefault", "_colorModeDefaultHint"]);
	assertChoice(settings.colorModeDefault, "settings.colorModeDefault", ["light", "dark", "system"]);
	assertString(settings._colorModeDefaultHint, "settings._colorModeDefaultHint", { maxLength: 240 });
}

function validateAnnouncement(announcement) {
	assertObject(announcement, "announcement", ["enabled", "message", "ctaLabel", "ctaHref"]);
	assertBoolean(announcement.enabled, "announcement.enabled");
	assertString(announcement.message, "announcement.message", { maxLength: 240 });
	assertString(announcement.ctaLabel, "announcement.ctaLabel", { maxLength: 60 });
	assertInternalHref(announcement.ctaHref, "announcement.ctaHref");
}

function validateContact(contact) {
	assertObject(contact, "contact", ["email", "callLabel", "textLabel", "phoneDisplay"]);
	assertEmail(contact.email, "contact.email");
	assertString(contact.callLabel, "contact.callLabel", { maxLength: 30 });
	assertString(contact.textLabel, "contact.textLabel", { maxLength: 30 });
	assertPhone(contact.phoneDisplay, "contact.phoneDisplay");
}

function validateHero(hero) {
	assertObject(hero, "hero", [
		"_location",
		"location",
		"headline",
		"_healine",
		"body",
		"primaryCta",
		"secondaryCta",
		"tags",
		"highlights"
	]);
	assertString(hero._location, "hero._location", { allowBoundaryWhitespace: true, maxLength: 120 });
	assertString(hero.location, "hero.location", { maxLength: 180 });
	assertString(hero.headline, "hero.headline", { maxLength: 120 });
	assertString(hero._healine, "hero._healine", { allowBoundaryWhitespace: true, maxLength: 160 });
	assertString(hero.body, "hero.body", { maxLength: 600 });

	assertObject(hero.primaryCta, "hero.primaryCta", ["label", "emailSubject"]);
	assertString(hero.primaryCta.label, "hero.primaryCta.label", { maxLength: 60 });
	assertString(hero.primaryCta.emailSubject, "hero.primaryCta.emailSubject", { maxLength: 120 });
	assertObject(hero.secondaryCta, "hero.secondaryCta", ["label"]);
	assertString(hero.secondaryCta.label, "hero.secondaryCta.label", { maxLength: 60 });

	const tags = assertArray(hero.tags, "hero.tags", { min: 1, max: 6 });
	for (const [index, tag] of tags.entries()) {
		const path = `hero.tags[${index}]`;
		assertObject(tag, path, ["label", "tone"]);
		assertString(tag.label, `${path}.label`, { maxLength: 60 });
		assertChoice(tag.tone, `${path}.tone`, ["amber", "emerald", "slate"]);
	}
	assertUnique(tags.map(tag => tag.label), "hero.tags labels");

	const highlights = assertArray(hero.highlights, "hero.highlights", { min: 1, max: 6 });
	for (const [index, highlight] of highlights.entries()) {
		const path = `hero.highlights[${index}]`;
		assertObject(highlight, path, ["title", "copy", "icon"]);
		assertString(highlight.title, `${path}.title`, { maxLength: 100 });
		assertString(highlight.copy, `${path}.copy`, { maxLength: 500 });
		assertString(highlight.icon, `${path}.icon`, {
			maxLength: 80,
			pattern: /^i-carbon-[a-z0-9-]+$/
		});
	}
	assertUnique(highlights.map(highlight => highlight.title), "hero.highlights titles");
}

function validateLessons(lessons) {
	assertObject(lessons, "lessons", ["cards"]);
	const cards = assertArray(lessons.cards, "lessons.cards", { min: 1, max: 6 });

	for (const [index, card] of cards.entries()) {
		const path = `lessons.cards[${index}]`;
		assertObject(card, path, ["name", "description", "format"]);
		assertString(card.name, `${path}.name`, { maxLength: 100 });
		assertString(card.description, `${path}.description`, { maxLength: 500 });
		assertString(card.format, `${path}.format`, { maxLength: 100 });
	}
	assertUnique(cards.map(card => card.name), "lessons.cards names");
}

function validateStudents(students) {
	assertObject(students, "students", ["eyebrow", "title", "body", "locationLabel", "support"]);
	assertString(students.eyebrow, "students.eyebrow", { maxLength: 80 });
	assertString(students.title, "students.title", { maxLength: 120 });
	assertString(students.body, "students.body", { maxLength: 600 });
	assertString(students.locationLabel, "students.locationLabel", { maxLength: 120 });

	const support = assertArray(students.support, "students.support", { min: 1, max: 9 });
	for (const [index, item] of support.entries()) {
		assertString(item, `students.support[${index}]`, { maxLength: 260 });
	}
	assertUnique(support, "students.support");
}

function validateTrial(trial) {
	assertObject(trial, "trial", [
		"eyebrow",
		"title",
		"body",
		"primaryLabel",
		"primarySubject",
		"secondaryLabel"
	]);
	assertString(trial.eyebrow, "trial.eyebrow", { maxLength: 80 });
	assertString(trial.title, "trial.title", { maxLength: 120 });
	assertString(trial.body, "trial.body", { maxLength: 600 });
	assertString(trial.primaryLabel, "trial.primaryLabel", { maxLength: 60 });
	assertString(trial.primarySubject, "trial.primarySubject", { maxLength: 120 });
	assertString(trial.secondaryLabel, "trial.secondaryLabel", { maxLength: 60 });
}

function validateContactForm(contactForm) {
	assertObject(contactForm, "contactForm", [
		"action",
		"title",
		"body",
		"submitLabel",
		"privacyNote",
		"submittedNote",
		"uncertainNote",
		"fields"
	]);
	assertString(contactForm.action, "contactForm.action", { maxLength: 200 });
	let formAction;
	try {
		formAction = new URL(contactForm.action);
	}
	catch {
		fail("contactForm.action", "must be a valid HTTPS Basin URL");
	}
	if (
		formAction.origin !== "https://usebasin.com"
		|| formAction.username
		|| formAction.password
		|| !/^\/f\/[A-Za-z0-9]+$/.test(formAction.pathname)
		|| formAction.search
		|| formAction.hash
	) {
		fail("contactForm.action", "must remain a direct Basin form endpoint");
	}

	assertString(contactForm.title, "contactForm.title", { maxLength: 120 });
	assertString(contactForm.body, "contactForm.body", { maxLength: 500 });
	assertString(contactForm.submitLabel, "contactForm.submitLabel", { maxLength: 60 });
	assertString(contactForm.privacyNote, "contactForm.privacyNote", { maxLength: 500 });
	assertString(contactForm.submittedNote, "contactForm.submittedNote", { maxLength: 500 });
	assertString(contactForm.uncertainNote, "contactForm.uncertainNote", { maxLength: 500 });
	if (!/Basin/.test(contactForm.privacyNote) || !/third-party/i.test(contactForm.privacyNote)) {
		fail("contactForm.privacyNote", "must identify Basin as a third-party form provider");
	}

	const expectedFields = [
		{ name: "name", type: "text", maxLength: 120, autocomplete: "name" },
		{ name: "email", type: "email", maxLength: 254, autocomplete: "email" },
		{ name: "message", type: "textarea", maxLength: 2000, autocomplete: "off" }
	];
	const fields = assertArray(contactForm.fields, "contactForm.fields", { min: 3, max: 3 });
	for (const [index, field] of fields.entries()) {
		const path = `contactForm.fields[${index}]`;
		const expected = expectedFields[index];
		assertObject(field, path, ["name", "label", "type", "required", "maxLength", "autocomplete"]);
		assertString(field.name, `${path}.name`, { maxLength: 30 });
		assertString(field.label, `${path}.label`, { maxLength: 120 });
		assertString(field.type, `${path}.type`, { maxLength: 20 });
		assertBoolean(field.required, `${path}.required`);
		assertInteger(field.maxLength, `${path}.maxLength`, expected.maxLength);
		assertString(field.autocomplete, `${path}.autocomplete`, { maxLength: 30 });
		if (field.name !== expected.name) fail(`${path}.name`, `must remain ${expected.name}`);
		if (field.type !== expected.type) fail(`${path}.type`, `must remain ${expected.type}`);
		if (field.required !== true) fail(`${path}.required`, "must remain true");
		if (field.autocomplete !== expected.autocomplete) {
			fail(`${path}.autocomplete`, `must remain ${expected.autocomplete}`);
		}
	}
}

function validateFooter(footer) {
	assertObject(footer, "footer", ["eyebrow", "body"]);
	assertString(footer.eyebrow, "footer.eyebrow", { maxLength: 80 });
	assertString(footer.body, "footer.body", { maxLength: 320 });
}

export function validateSiteContent(content) {
	assertObject(content, "root", [
		"site",
		"settings",
		"announcement",
		"contact",
		"hero",
		"lessons",
		"students",
		"trial",
		"contactForm",
		"footer"
	]);

	validateSiteIdentity(content.site);
	validateSettings(content.settings);
	validateAnnouncement(content.announcement);
	validateContact(content.contact);
	validateHero(content.hero);
	validateLessons(content.lessons);
	validateStudents(content.students);
	validateTrial(content.trial);
	validateContactForm(content.contactForm);
	validateFooter(content.footer);

	return content;
}

export function loadAndValidateSiteContent(path = SITE_CONTENT_PATH) {
	let content;
	try {
		content = JSON.parse(readFileSync(path, "utf8"));
	}
	catch (error) {
		fail("root", `could not read valid JSON from ${path}: ${error.message}`);
	}

	return validateSiteContent(content);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
	try {
		loadAndValidateSiteContent();
		process.stdout.write(`Site content is valid: ${SITE_CONTENT_PATH}\n`);
	}
	catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (process.env.GITHUB_ACTIONS === "true") {
			const annotation = message.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
			process.stderr.write(`::error title=Website content needs attention::${annotation}\n`);
		}
		else {
			process.stderr.write(`${message}\n`);
		}
		process.exitCode = 1;
	}
}
