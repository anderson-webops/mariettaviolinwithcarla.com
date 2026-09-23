import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(readFileSync(path.join(repositoryRoot, "front-end/src/content/site.json"), "utf8"));
const port = Number(process.env.E2E_FRONTEND_PORT || 3333);
const baseUrl = `http://127.0.0.1:${port}`;
const chromePath = [
	process.env.PUPPETEER_EXECUTABLE_PATH,
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	"/Applications/Chromium.app/Contents/MacOS/Chromium",
	"/usr/bin/google-chrome-stable",
	"/usr/bin/google-chrome",
	"/usr/bin/chromium"
].find(candidate => candidate && existsSync(candidate));

if (!existsSync(path.join(repositoryRoot, "front-end/dist/index.html"))) {
	throw new Error("Build the static artifact before running browser acceptance tests.");
}
if (!chromePath) {
	throw new Error("Browser acceptance requires an installed Chrome or Chromium executable.");
}

async function waitForHttp(url, timeoutMs = 30_000) {
	const started = Date.now();
	let lastError;
	while (Date.now() - started < timeoutMs) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
			lastError = new Error(`${url} returned ${response.status}.`);
		}
		catch (error) {
			lastError = error;
		}
		await new Promise(resolveWait => setTimeout(resolveWait, 250));
	}
	throw lastError || new Error(`Timed out waiting for ${url}.`);
}

async function stopProcess(child) {
	if (!child.pid || child.exitCode !== null) return;
	const target = process.platform === "win32" ? child.pid : -child.pid;
	try {
		process.kill(target, "SIGTERM");
	}
	catch (error) {
		if (error?.code !== "ESRCH") throw error;
	}
	await new Promise((resolveWait) => {
		const timer = setTimeout(() => {
			try {
				process.kill(target, "SIGKILL");
			}
			catch (error) {
				if (error?.code !== "ESRCH") throw error;
			}
			resolveWait();
		}, 2_000);
		child.once("exit", () => {
			clearTimeout(timer);
			resolveWait();
		});
	});
}

const server = spawn(process.execPath, ["front-end/scripts/preview.mjs", "--port", String(port)], {
	cwd: repositoryRoot,
	detached: process.platform !== "win32",
	env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
	stdio: "inherit"
});

let browser;
try {
	await waitForHttp(baseUrl);
	browser = await puppeteer.launch({
		executablePath: chromePath,
		headless: true,
		args: ["--disable-dev-shm-usage", "--no-sandbox"]
	});
	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on("request", (request) => {
		const requestUrl = new URL(request.url());
		if (requestUrl.origin === baseUrl) request.continue();
		else request.abort();
	});

	await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
	const observed = await page.evaluate(() => {
		const text = selector => document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim();
		const attributes = (selector) => {
			const element = document.querySelector(selector);
			return element
				? Object.fromEntries([...element.attributes].map(attribute => [attribute.name, attribute.value]))
				: null;
		};
		return {
			headline: text("h1"),
			lessonNames: [...document.querySelectorAll("section#lessons > div > p:first-child")]
				.map(element => element.textContent?.trim()),
			studentItems: document.querySelectorAll("section#students li").length,
			form: attributes("section#contact form"),
			fields: [...document.querySelectorAll("section#contact form input, section#contact form textarea")].map(element => ({
				autocomplete: element.getAttribute("autocomplete"),
				maxLength: element.getAttribute("maxlength"),
				name: element.getAttribute("name"),
				type: element.tagName === "TEXTAREA" ? "textarea" : element.getAttribute("type")
			})),
			formParagraphs: [...document.querySelectorAll("section#contact form p.text-xs")]
				.map(element => element.textContent?.trim()),
			iframe: attributes("iframe[name=\"basin-iframe\"]"),
			footer: text("footer"),
			tracker: attributes("script[src=\"/vendor/umami-tracker.js\"]"),
			mailHref: document.querySelector("a[href^=\"mailto:\"]")?.getAttribute("href"),
			phoneHrefs: [...document.querySelectorAll("a[href^=\"tel:\"], a[href^=\"sms:\"]")].map(element => element.getAttribute("href"))
		};
	});

	assert.equal(observed.headline, site.hero.headline);
	for (const card of site.lessons.cards) assert.ok(observed.lessonNames.includes(card.name));
	assert.ok(observed.studentItems > 3);
	assert.equal(observed.form?.action, site.contactForm.action);
	assert.deepEqual(observed.fields, site.contactForm.fields.map(field => ({
		autocomplete: field.autocomplete,
		maxLength: String(field.maxLength),
		name: field.name,
		type: field.type
	})));
	assert.ok(observed.formParagraphs.includes(site.contactForm.privacyNote));
	assert.equal(observed.iframe?.sandbox, "allow-forms");
	assert.equal(observed.iframe?.referrerpolicy, "no-referrer");
	assert.match(observed.footer || "", new RegExp(site.footer.eyebrow, "i"));
	assert.match(observed.mailHref || "", new RegExp(site.contact.email.replaceAll(".", "\\.")));
	assert.ok(observed.phoneHrefs.some(href => href?.startsWith("tel:")));
	assert.ok(observed.phoneHrefs.some(href => href?.startsWith("sms:")));
	assert.equal(observed.tracker?.["data-host-url"], "https://analytics.mariettaviolinwithcarla.com");
	assert.equal(observed.tracker?.["data-domains"], "mariettaviolinwithcarla.com");

	process.stdout.write("Browser acceptance passed with all external requests blocked.\n");
	await page.close();
}
finally {
	if (browser) await browser.close();
	await stopProcess(server);
}
