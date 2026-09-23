import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const nginx = readFileSync("deploy/nginx/mariettaviolinwithcarla.conf.example", "utf8");
const homeLayout = readFileSync("front-end/src/layouts/home.vue", "utf8");
const prepare = readFileSync("deploy/direct/prepare-static-release.sh", "utf8");
const promote = readFileSync("deploy/direct/promote-static-release.sh", "utf8");
const installer = readFileSync("deploy/direct/install-trusted-helpers.sh", "utf8");
const artifactTool = readFileSync("scripts/static-artifact.py", "utf8");
const contract = JSON.parse(readFileSync("deploy/static-artifact.json", "utf8"));
const deployment = readFileSync("DEPLOYMENT.md", "utf8");
const netlify = readFileSync("netlify.toml", "utf8");
const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const dependabot = readFileSync(".github/dependabot.yml", "utf8");

test("production is an atomic direct static release without Docker", () => {
	assert.equal(existsSync("Dockerfile"), false);
	assert.equal(existsSync(".dockerignore"), false);
	assert.equal(existsSync("deploy/nginx/nginx.conf"), false);
	assert.doesNotMatch(workflow, /docker|container:/i);
	assert.doesNotMatch(dependabot, /package-ecosystem:\s*docker/);

	assert.match(prepare, /npm ci --include=dev --include=optional --strict-allow-scripts/);
	assert.match(prepare, /audit:signatures/);
	assert.match(prepare, /static-artifact\.py" pack/);
	assert.match(prepare, /npm run test:e2e/);
	assert.doesNotMatch(prepare, /npm ci --omit=dev/);
	assert.match(installer, /\/usr\/local\/libexec\/marietta-violin-static-release/);
	assert.match(installer, /--tree "\$source_root"/);
	assert.match(promote, /artifact-releases/);
	assert.match(promote, /--archive "\$protected_archive" --sha256 "\$archive_sha"/);
	assert.match(promote, /--allow-legacy/);
	assert.match(promote, /reviewed-legacy-archive/);
	assert.match(promote, /protected_rollback_archive/);
	assert.match(promote, /rollback_sha/);
	assert.doesNotMatch(promote, /\bsnapshot\b|current_target\/front-end\/dist/);
	assert.doesNotMatch(artifactTool, /def snapshot|choices=\[[^\]]*"snapshot"/);
	assert.match(promote, /resolve_ipv6/);
	assert.match(promote, /restoring the sealed previous release/i);
	assert.doesNotMatch(promote, /\bgit\b|\bnpm\b|\bnode\b/);
	assert.doesNotMatch(deployment, /sudo deploy\/direct\/promote-static-release\.sh/);
	assert.match(deployment, /\/usr\/local\/libexec\/marietta-violin-static-release/);
	assert.match(deployment, /separately approved[\s\S]*legacy-rollback/);
	assert.deepEqual(contract.productionDependencies, []);
	assert.deepEqual(contract.writableState, []);
	assert.equal(contract.runtime.applicationProcesses, 0);
});

test("direct and preview hosting reject retired routes and preserve the form boundary", () => {
	assert.match(nginx, /listen 443 ssl;/);
	assert.match(nginx, /listen \[::\]:443 ssl;/);
	assert.match(nginx, /http2 on;/);
	assert.match(
		nginx,
		/root \/srv\/mariettaviolinwithcarla\.com\/current\/front-end\/dist/
	);
	assert.match(nginx, /accounts/);
	assert.match(nginx, /_dbinfo/);
	assert.match(nginx, /return 404/);
	assert.match(nginx, /form-action https:\/\/usebasin\.com/);
	assert.doesNotMatch(nginx, /analytics\.jacobdanderson\.net/);
	assert.doesNotMatch(nginx, /script-src[^;]*analytics\.mariettaviolinwithcarla\.com/);
	assert.match(nginx, /connect-src[^;]*analytics\.mariettaviolinwithcarla\.com/);
	assert.doesNotMatch(nginx, /unsafe-eval|wasm-unsafe-eval/);

	assert.match(netlify, /from = "\/accounts\/\*"/);
	assert.match(netlify, /from = "\/_dbinfo"/);
	assert.doesNotMatch(netlify, /analytics\.jacobdanderson\.net/);
	assert.doesNotMatch(netlify, /script-src[^;]*analytics\.mariettaviolinwithcarla\.com/);
	assert.match(netlify, /connect-src[^;]*analytics\.mariettaviolinwithcarla\.com/);
	assert.doesNotMatch(netlify, /from = "\/\*"\s+to = "\/index\.html"/);
	assert.doesNotMatch(netlify, /unsafe-eval|wasm-unsafe-eval/);
});

test("same-page navigation avoids duplicate Nuxt payload prefetches", () => {
	assert.doesNotMatch(homeLayout, /<NuxtLink[^>]*(?:to|:to)="[^"]*#/);
});
