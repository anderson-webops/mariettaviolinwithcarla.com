import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(repositoryRoot, "front-end/.output/public");
const destination = path.join(repositoryRoot, "front-end/dist");

if (!source.startsWith(`${repositoryRoot}${path.sep}`) || !destination.startsWith(`${repositoryRoot}${path.sep}`)) {
	throw new Error("Refusing to prepare static output outside the repository.");
}

await rm(destination, { force: true, recursive: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { force: true, recursive: true });

process.stdout.write("Prepared front-end/dist from Nuxt static output.\n");
