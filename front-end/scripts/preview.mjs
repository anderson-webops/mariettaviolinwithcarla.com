import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";

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
const host = process.env.HOST || "0.0.0.0";
const outputDir = resolve(".output/public");

if (!existsSync(outputDir)) {
	const build = spawnSync("npx", ["nuxt", "generate"], {
		stdio: "inherit",
		env: { ...process.env }
	});

	if (build.status !== 0) {
		process.exit(build.status ?? 1);
	}
}

const serve = spawn("npx", ["serve", outputDir, "-l", port, "-n"], {
	stdio: "inherit",
	env: {
		...process.env,
		PORT: port,
		HOST: host
	}
});

serve.on("exit", code => {
	// eslint-disable-next-line no-process-exit
	process.exit(code ?? 0);
});
