import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function pickPort() {
	const envPort = process.env.PORT || process.env.npm_config_port;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--port" || args[i] === "-p") {
			return args[i + 1] ?? envPort ?? "3333";
		}
	}

	return envPort ?? "3333";
}

const port = pickPort();
const host = process.env.HOST || "127.0.0.1";
const outputDir = resolve(frontendRoot, "dist");

if (!existsSync(outputDir)) {
	throw new Error("Static output is missing. Run npm run build before previewing.");
}

const servePackagePath = require.resolve("serve/package.json");
const servePackage = JSON.parse(readFileSync(servePackagePath, "utf8"));
const serveEntry = resolve(dirname(servePackagePath), servePackage.bin.serve);
const server = spawn(process.execPath, [serveEntry, outputDir, "--listen", `tcp://${host}:${port}`, "--no-clipboard"], {
	stdio: "inherit",
	env: {
		...process.env,
		PORT: port,
		HOST: host
	}
});

server.on("exit", (code) => {
	process.exit(code ?? 0);
});
