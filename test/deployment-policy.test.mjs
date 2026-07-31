import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dockerfile = readFileSync("Dockerfile", "utf8");
const nginx = readFileSync("deploy/nginx/nginx.conf", "utf8");
const netlify = readFileSync("netlify.toml", "utf8");

test("container images and runtime identity are pinned and unprivileged", () => {
	assert.match(dockerfile, /^FROM node:24\.18\.1-alpine@sha256:[0-9a-f]{64}/m);
	assert.match(dockerfile, /^FROM nginx:stable-alpine@sha256:[0-9a-f]{64}/m);
	assert.match(dockerfile, /^USER 101:101$/m);
	assert.match(dockerfile, /SOURCE_COMMIT/);
	assert.doesNotMatch(dockerfile, /\.output\/server|back-end/);
});

test("hosting policies reject retired routes and avoid permissive script evaluation", () => {
	assert.match(nginx, /accounts/);
	assert.match(nginx, /_dbinfo/);
	assert.match(nginx, /return 404/);
	assert.match(nginx, /form-action https:\/\/usebasin\.com/);
	assert.doesNotMatch(nginx, /unsafe-eval|wasm-unsafe-eval/);

	assert.match(netlify, /from = "\/accounts\/\*"/);
	assert.match(netlify, /from = "\/_dbinfo"/);
	assert.doesNotMatch(netlify, /from = "\/\*"\s+to = "\/index\.html"/);
	assert.doesNotMatch(netlify, /unsafe-eval|wasm-unsafe-eval/);
});
