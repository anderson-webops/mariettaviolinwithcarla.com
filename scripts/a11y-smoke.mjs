import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve("axe-core/axe.min.js");
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.A11Y_FRONTEND_PORT || 3350);
const baseUrl = `http://127.0.0.1:${port}`;
const routes = ["/", "/404.html"];
const colorSchemes = ["light", "dark"];
const npmCommand = process.platform === "win32" ? "npm.cmd" : path.join(path.dirname(process.execPath), "npm");
const chromePath = [
	process.env.PUPPETEER_EXECUTABLE_PATH,
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	"/Applications/Chromium.app/Contents/MacOS/Chromium",
	"/usr/bin/google-chrome-stable",
	"/usr/bin/google-chrome",
	"/usr/bin/chromium"
].find(candidate => candidate && existsSync(candidate));

function run(command, args) {
	return new Promise((resolveRun, reject) => {
		const child = spawn(command, args, {
			cwd: repositoryRoot,
			env: {
				...process.env,
				CYPRESS_INSTALL_BINARY: "0",
				NUXT_TELEMETRY_DISABLED: "1",
				PUPPETEER_SKIP_DOWNLOAD: "true"
			},
			stdio: "inherit"
		});
		child.once("error", reject);
		child.once("exit", code =>
			code === 0 ? resolveRun() : reject(new Error(`${command} exited with code ${code}.`)));
	});
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
		await new Promise(resolveWait => setTimeout(resolveWait, 300));
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
		const timer = setTimeout(resolveWait, 2_000);
		child.once("exit", () => {
			clearTimeout(timer);
			resolveWait();
		});
	});
}

await run(npmCommand, ["run", "build"]);

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

	const failures = [];
	for (const route of routes) {
		for (const scheme of colorSchemes) {
			const page = await browser.newPage();
			await page.setRequestInterception(true);
			page.on("request", (request) => {
				const requestUrl = new URL(request.url());
				if (requestUrl.origin === baseUrl) request.continue();
				else request.abort();
			});
			await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
			await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
			await page.addScriptTag({ path: axeSourcePath });
			const result = await page.evaluate(async () =>
				globalThis.axe.run(document, {
					resultTypes: ["violations"],
					runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] }
				})
			);
			const violations = result.violations.filter(violation => violation.id !== "frame-tested");
			if (violations.length) failures.push({ route, scheme, violations });
			else process.stdout.write(`a11y ok: ${route} [${scheme}]\n`);
			await page.close();
		}
	}

	if (failures.length) {
		for (const failure of failures) {
			process.stderr.write(`Accessibility failures at ${failure.route} [${failure.scheme}]:\n`);
			for (const violation of failure.violations) {
				process.stderr.write(`- ${violation.id}: ${violation.help}\n`);
			}
		}
		process.exitCode = 1;
	}
}
finally {
	if (browser) await browser.close();
	await stopProcess(server);
}
