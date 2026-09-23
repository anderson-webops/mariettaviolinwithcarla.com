import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateSiteContent } from "./validate-site-content.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = "front-end/src/content/site.json";

function protectedContent(content) {
	return {
		announcementCtaHref: content.announcement.ctaHref,
		contactForm: content.contactForm,
		heroCompatibilityFields: {
			_location: content.hero._location,
			_healine: content.hero._healine
		},
		settingsCompatibilityFields: {
			_colorModeDefaultHint: content.settings._colorModeDefaultHint
		}
	};
}

export function validateContentTransition(baseContent, proposedContent, changedFiles) {
	assert.deepEqual(
		changedFiles,
		[{ filename: contentPath, status: "modified" }],
		"The content branch may modify only the existing site content file."
	);
	validateSiteContent(proposedContent);
	assert.deepEqual(
		protectedContent(proposedContent),
		protectedContent(baseContent),
		"Maintainer-managed destinations and compatibility fields must not change through the content branch."
	);
	return proposedContent;
}

async function githubJson(url, token) {
	const response = await fetch(url, {
		headers: {
			"Accept": "application/vnd.github+json",
			"Authorization": `Bearer ${token}`,
			"X-GitHub-Api-Version": "2022-11-28"
		}
	});
	if (!response.ok) throw new Error(`GitHub API ${response.status} for ${url}`);
	return response.json();
}

async function run() {
	const contentBranch = process.env.CONTENT_BRANCH || "content-updates";
	if (process.env.PR_HEAD_REF !== contentBranch) {
		process.stdout.write(`Content policy does not apply to branch ${process.env.PR_HEAD_REF || "(unknown)"}.\n`);
		return;
	}

	const token = process.env.GITHUB_TOKEN;
	const repository = process.env.REPOSITORY;
	const pullRequest = process.env.PR_NUMBER;
	const headSha = process.env.PR_HEAD_SHA;
	if (!token || !repository || !pullRequest || !headSha) {
		throw new Error("The content policy requires the bounded GitHub pull-request context.");
	}

	const files = [];
	for (let page = 1; ; page += 1) {
		const batch = await githubJson(
			`https://api.github.com/repos/${repository}/pulls/${pullRequest}/files?per_page=100&page=${page}`,
			token
		);
		files.push(...batch.map(({ filename, status }) => ({ filename, status })));
		if (batch.length < 100) break;
		if (page >= 10) throw new Error("Content proposal exceeds the bounded changed-file inventory.");
	}
	const response = await githubJson(
		`https://api.github.com/repos/${repository}/contents/${contentPath}?ref=${headSha}`,
		token
	);
	if (response.encoding !== "base64" || typeof response.content !== "string") {
		throw new Error("GitHub did not return the proposed content as bounded base64 data.");
	}
	const decoded = Buffer.from(response.content.replaceAll("\n", ""), "base64");
	if (decoded.length > 128 * 1024) throw new Error("Proposed site content exceeds 128 KiB.");

	const base = JSON.parse(await readFile(path.join(repositoryRoot, contentPath), "utf8"));
	const proposed = JSON.parse(decoded.toString("utf8"));
	validateContentTransition(base, proposed, files);
	process.stdout.write("Content proposal remains inside the reviewed editing boundary.\n");
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
	run().catch((error) => {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	});
}
