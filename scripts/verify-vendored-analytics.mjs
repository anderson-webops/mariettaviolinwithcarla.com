import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const trackerPath = path.join(repositoryRoot, "front-end/public/vendor/umami-tracker.js");
const provenancePath = path.join(repositoryRoot, "vendor/umami-tracker.provenance.json");
const tracker = await readFile(trackerPath);
const provenance = JSON.parse(await readFile(provenancePath, "utf8"));
const digest = createHash("sha256").update(tracker).digest("hex");

assert.deepEqual(Object.keys(provenance).sort(), [
	"sha256",
	"sourceCommit",
	"sourcePath",
	"sourceRepository"
]);
assert.equal(provenance.sourceRepository, "anderson-webops/analytics.mariettaviolinwithcarla.com");
assert.match(provenance.sourceCommit, /^[0-9a-f]{40}$/);
assert.equal(provenance.sourcePath, "public/script.js");
assert.match(provenance.sha256, /^[0-9a-f]{64}$/);
assert.equal(digest, provenance.sha256, "Vendored tracker differs from its reviewed provenance digest.");
assert.ok(tracker.length > 1_000 && tracker.length < 32_000, "Vendored tracker size is outside its reviewed bounds.");
assert.ok(tracker.includes(Buffer.from("host-url")), "Vendored tracker must honor the explicit analytics host.");
assert.ok(tracker.includes(Buffer.from("/api/send")), "Vendored tracker must retain the reviewed collection endpoint.");
assert.equal(tracker.includes(Buffer.from("sourceMappingURL")), false, "Vendored tracker must not reference source maps.");

process.stdout.write(`Verified vendored analytics tracker ${digest}.\n`);
