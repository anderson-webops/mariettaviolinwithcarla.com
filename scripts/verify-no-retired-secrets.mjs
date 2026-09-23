import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const modulePath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(modulePath), "..");
const retiredBackend = path.join(repositoryRoot, "back-end");

export async function assertNoRetiredEnvironmentFiles(directory) {
	let entries;
	try {
		entries = await readdir(directory, { withFileTypes: true });
	}
	catch (error) {
		if (error?.code === "ENOENT") return;
		throw error;
	}

	for (const entry of entries) {
		if (entry.name === ".env" || entry.name.startsWith(".env.")) {
			throw new Error(
				"Retired backend environment material is present. Revoke or rotate its values, then remove the file without printing or archiving it."
			);
		}

		if (entry.isSymbolicLink()) {
			throw new Error("Retired backend material must not contain symbolic links.");
		}

		if (entry.isDirectory()) {
			await assertNoRetiredEnvironmentFiles(path.join(directory, entry.name));
		}
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
	await assertNoRetiredEnvironmentFiles(retiredBackend);
	process.stdout.write("No retired backend environment files are present.\n");
}
