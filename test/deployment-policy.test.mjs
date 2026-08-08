import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const nginx = readFileSync("deploy/nginx/mariettaviolinwithcarla.conf.example", "utf8");
const homeLayout = readFileSync("front-end/src/layouts/home.vue", "utf8");
const prepare = readFileSync("deploy/direct/prepare-static-release.sh", "utf8");
const promote = readFileSync("deploy/direct/promote-static-release.sh", "utf8");
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
	assert.match(prepare, /npm ci --omit=dev --include=optional --ignore-scripts/);
	assert.match(prepare, /audit:signatures/);
	assert.match(promote, /\.marietta-violin-static-release\.json/);
	assert.match(promote, /SITE_RESOLVE_IPV6/);
	assert.match(promote, /restoring the previous release/i);
});

test("direct and preview hosting reject retired routes and preserve the form boundary", () => {
	assert.match(nginx, /listen 443 ssl http2/);
	assert.match(nginx, /listen \[::\]:443 ssl http2/);
	assert.match(
		nginx,
		/root \/srv\/mariettaviolinwithcarla\.com\/current\/front-end\/dist/
	);
	assert.match(nginx, /accounts/);
	assert.match(nginx, /_dbinfo/);
	assert.match(nginx, /return 404/);
	assert.match(nginx, /form-action https:\/\/usebasin\.com/);
	assert.doesNotMatch(nginx, /analytics\.jacobdanderson\.net/);
	assert.doesNotMatch(nginx, /unsafe-eval|wasm-unsafe-eval/);

	assert.match(netlify, /from = "\/accounts\/\*"/);
	assert.match(netlify, /from = "\/_dbinfo"/);
	assert.doesNotMatch(netlify, /analytics\.jacobdanderson\.net/);
	assert.doesNotMatch(netlify, /from = "\/\*"\s+to = "\/index\.html"/);
	assert.doesNotMatch(netlify, /unsafe-eval|wasm-unsafe-eval/);
});

test("same-page navigation avoids duplicate Nuxt payload prefetches", () => {
	assert.doesNotMatch(homeLayout, /<NuxtLink[^>]*(?:to|:to)="[^"]*#/);
});
