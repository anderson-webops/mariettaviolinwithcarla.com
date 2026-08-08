import assert from "node:assert/strict";
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(repositoryRoot, "front-end/dist");
const rootPackage = JSON.parse(await readFile(path.join(repositoryRoot, "package.json"), "utf8"));
const requiredFiles = [
	"404.html",
	"deployment.json",
	"healthz.json",
	"index.html",
	"readyz.json",
	"release.json",
	"robots.txt",
	"sitemap.xml"
];

async function walk(directory, prefix = "") {
	const files = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const relativePath = path.posix.join(prefix, entry.name);
		const absolutePath = path.join(directory, entry.name);
		const metadata = await lstat(absolutePath);
		assert.equal(metadata.isSymbolicLink(), false, `Static output must not contain symlink ${relativePath}.`);
		if (entry.isDirectory()) files.push(...(await walk(absolutePath, relativePath)));
		else files.push(relativePath);
	}
	return files;
}

const files = await walk(outputRoot);
for (const requiredFile of requiredFiles) {
	assert.ok(files.includes(requiredFile), `Missing static deployment file: ${requiredFile}`);
}

const forbiddenFiles = files.filter(
	filename =>
		filename.endsWith(".map")
		|| filename === ".env"
		|| filename.startsWith(".env.")
		|| filename.startsWith("server/")
);
assert.deepEqual(forbiddenFiles, [], `Forbidden static deployment files: ${forbiddenFiles.join(", ")}`);

const deployment = JSON.parse(await readFile(path.join(outputRoot, "deployment.json"), "utf8"));
const release = JSON.parse(await readFile(path.join(outputRoot, "release.json"), "utf8"));
assert.match(deployment.commit, /^[0-9a-f]{40}$/);
assert.equal(deployment.runtime, "nuxt-static");
assert.equal(deployment.service, "mariettaviolinwithcarla.com");
assert.equal(deployment.version, rootPackage.version);
assert.deepEqual(release, deployment);

const health = JSON.parse(await readFile(path.join(outputRoot, "healthz.json"), "utf8"));
const readiness = JSON.parse(await readFile(path.join(outputRoot, "readyz.json"), "utf8"));
assert.equal(health.status, "ok");
assert.equal(readiness.status, "ready");
assert.deepEqual(readiness.dependencies, []);

const homepage = await readFile(path.join(outputRoot, "index.html"), "utf8");
assert.match(homepage, /Violin lessons with Carla/i);
assert.match(homepage, /analytics\.mariettaviolinwithcarla\.com/);
assert.match(homepage, /data-domains="mariettaviolinwithcarla\.com"/);
assert.doesNotMatch(homepage, /analytics\.jacobdanderson\.net/);

const sitemap = await readFile(path.join(outputRoot, "sitemap.xml"), "utf8");
assert.match(sitemap, /https:\/\/mariettaviolinwithcarla\.com\//);

const textFiles = files.filter(filename => /\.(?:html|js|json|xml|txt)$/i.test(filename));
const forbiddenRuntimeMarkers = ["MONGODB_URI", "ADMIN_SESSION_SECRET", "/accounts/me", "/_dbinfo"];
for (const filename of textFiles) {
	const content = await readFile(path.join(outputRoot, filename), "utf8");
	for (const marker of forbiddenRuntimeMarkers) {
		assert.equal(content.includes(marker), false, `${filename} contains retired backend marker ${marker}.`);
	}
}

process.stdout.write(`Verified ${files.length} static deployment files.\n`);
