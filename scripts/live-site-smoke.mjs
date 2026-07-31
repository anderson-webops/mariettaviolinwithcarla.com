import assert from "node:assert/strict";
import process from "node:process";

const baseUrl = new URL(process.env.LIVE_SMOKE_BASE_URL || "https://mariettaviolinwithcarla.com");
const expectedCommit = String(process.env.LIVE_SMOKE_EXPECT_COMMIT || "").trim();

async function fetchChecked(pathname, expectedStatus = 200) {
	const url = new URL(pathname, baseUrl);
	const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
	assert.equal(response.status, expectedStatus, `${url} returned ${response.status}; expected ${expectedStatus}.`);
	return response;
}

const homepage = await fetchChecked("/");
assert.match(await homepage.text(), /Violin lessons with Carla/i);
for (const header of ["content-security-policy", "referrer-policy", "x-content-type-options", "x-frame-options"]) {
	assert.ok(homepage.headers.get(header), `Homepage is missing ${header}.`);
}

const deployment = await (await fetchChecked("/deployment.json")).json();
assert.equal(deployment.runtime, "nuxt-static");
assert.equal(deployment.service, "mariettaviolinwithcarla.com");
assert.match(deployment.commit, /^[0-9a-f]{40}$/);
if (expectedCommit) assert.equal(deployment.commit, expectedCommit);

await fetchChecked("/healthz");
await fetchChecked("/readyz");
await fetchChecked("/sitemap.xml");
for (const retiredPath of ["/_dbinfo", "/accounts/me", "/admin", "/api", "/not-a-real-page"]) {
	await fetchChecked(retiredPath, 404);
}

process.stdout.write(`Live smoke ok: ${baseUrl.origin}\n`);
