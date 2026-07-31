import assert from "node:assert/strict";
import process from "node:process";

const baseUrl = new URL(process.env.DEPLOYMENT_SMOKE_BASE_URL || "http://127.0.0.1:18080");
const expectedCommit = String(process.env.DEPLOYMENT_SMOKE_EXPECT_COMMIT || "").trim();

async function fetchChecked(pathname, expectedStatus = 200, options = {}) {
	const url = new URL(pathname, baseUrl);
	const response = await fetch(url, {
		redirect: "manual",
		signal: AbortSignal.timeout(15_000),
		...options
	});
	assert.equal(response.status, expectedStatus, `${url} returned ${response.status}; expected ${expectedStatus}.`);
	return response;
}

const homepage = await fetchChecked("/");
const homepageHtml = await homepage.text();
assert.match(homepageHtml, /Violin lessons with Carla/i);

const requiredHeaders = [
	"content-security-policy",
	"cross-origin-opener-policy",
	"cross-origin-resource-policy",
	"permissions-policy",
	"referrer-policy",
	"strict-transport-security",
	"x-content-type-options",
	"x-frame-options"
];
for (const header of requiredHeaders) assert.ok(homepage.headers.get(header), `Homepage is missing ${header}.`);

const csp = homepage.headers.get("content-security-policy") || "";
assert.match(csp, /frame-ancestors 'none'/);
assert.match(csp, /form-action https:\/\/usebasin\.com/);
assert.doesNotMatch(csp, /unsafe-eval|wasm-unsafe-eval|\*/);

for (const endpoint of ["/healthz", "/readyz"]) {
	const response = await fetchChecked(endpoint);
	assert.match(response.headers.get("content-type") || "", /application\/json/i);
	const body = await response.json();
	assert.ok(body.status === "ok" || body.status === "ready");
}

const deployment = await (await fetchChecked("/deployment.json")).json();
assert.equal(deployment.runtime, "nuxt-static");
assert.equal(deployment.service, "mariettaviolinwithcarla.com");
assert.match(deployment.commit, /^[0-9a-f]{40}$/);
if (expectedCommit) assert.equal(deployment.commit, expectedCommit);

await fetchChecked("/release.json");
await fetchChecked("/sitemap.xml");
for (const retiredPath of ["/_dbinfo", "/accounts/me", "/admin", "/api", "/api/healthz", "/not-a-real-page"]) {
	await fetchChecked(retiredPath, 404);
}
await fetchChecked("/", 405, { method: "POST" });

process.stdout.write(`Production deployment smoke ok: ${baseUrl.origin}\n`);
