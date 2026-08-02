import assert from "node:assert/strict";
import process from "node:process";

const baseUrl = new URL(
	process.env.LIVE_SMOKE_BASE_URL
	|| process.env.DEPLOYMENT_SMOKE_BASE_URL
	|| "https://mariettaviolinwithcarla.com"
);
const expectedCommit = String(
	process.env.LIVE_SMOKE_EXPECT_COMMIT
	|| process.env.DEPLOYMENT_SMOKE_EXPECT_COMMIT
	|| ""
).trim();

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
assert.match(await homepage.text(), /Violin lessons with Carla/i);
for (const header of [
	"content-security-policy",
	"cross-origin-opener-policy",
	"cross-origin-resource-policy",
	"permissions-policy",
	"referrer-policy",
	"strict-transport-security",
	"x-content-type-options",
	"x-frame-options"
]) {
	assert.ok(homepage.headers.get(header), `Homepage is missing ${header}.`);
}
const csp = homepage.headers.get("content-security-policy") || "";
assert.match(csp, /frame-ancestors 'none'/);
assert.match(csp, /form-action https:\/\/usebasin\.com/);
assert.doesNotMatch(csp, /unsafe-eval|wasm-unsafe-eval|\*/);

const deployment = await (await fetchChecked("/deployment.json")).json();
assert.equal(deployment.runtime, "nuxt-static");
assert.equal(deployment.service, "mariettaviolinwithcarla.com");
assert.match(deployment.commit, /^[0-9a-f]{40}$/);
if (expectedCommit) assert.equal(deployment.commit, expectedCommit);

const release = await (await fetchChecked("/release.json")).json();
assert.deepEqual(release, deployment);

for (const endpoint of ["/healthz", "/readyz"]) {
	const response = await fetchChecked(endpoint);
	assert.match(response.headers.get("content-type") || "", /application\/json/i);
	const body = await response.json();
	assert.ok(body.status === "ok" || body.status === "ready");
}
await fetchChecked("/sitemap.xml");
for (const retiredPath of [
	"/_dbinfo",
	"/accounts/me",
	"/admin",
	"/api",
	"/api/healthz",
	"/not-a-real-page"
]) {
	await fetchChecked(retiredPath, 404);
}
await fetchChecked("/", 405, { method: "POST" });

process.stdout.write(`Live smoke ok: ${baseUrl.origin}\n`);
