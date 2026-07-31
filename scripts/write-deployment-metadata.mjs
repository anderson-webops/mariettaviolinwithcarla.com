import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendOutput = path.join(repositoryRoot, "front-end/.output/public");
const rootPackage = JSON.parse(await readFile(path.join(repositoryRoot, "package.json"), "utf8"));

function gitValue(args) {
	try {
		return execFileSync("git", args, {
			cwd: repositoryRoot,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"]
		}).trim();
	}
	catch {
		return "";
	}
}

function sanitizeRef(value) {
	return String(value || "")
		.trim()
		.replaceAll(/[^\w./@:+-]/g, "")
		.slice(0, 160);
}

const commit = String(
	process.env.SOURCE_COMMIT
	|| process.env.COMMIT_REF
	|| process.env.GITHUB_SHA
	|| gitValue(["rev-parse", "HEAD"])
).trim();

if (!/^[0-9a-f]{40}$/i.test(commit)) {
	throw new Error("Deployment metadata requires an exact 40-character source commit.");
}

const ref = sanitizeRef(
	process.env.SOURCE_TAG
	|| process.env.RELEASE_VERSION
	|| process.env.GITHUB_REF_NAME
	|| process.env.BRANCH
	|| gitValue(["describe", "--tags", "--exact-match"])
	|| gitValue(["branch", "--show-current"])
	|| "untagged"
);

const metadata = {
	commit: commit.toLowerCase(),
	ok: true,
	ref,
	runtime: "nuxt-static",
	service: "mariettaviolinwithcarla.com",
	version: rootPackage.version
};

await mkdir(frontendOutput, { recursive: true });
await Promise.all(
	["deployment.json", "release.json"].map(filename =>
		writeFile(path.join(frontendOutput, filename), `${JSON.stringify(metadata, null, 2)}\n`, "utf8")
	)
);

process.stdout.write(`Wrote static deployment metadata for ${metadata.commit}.\n`);
