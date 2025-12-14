// vite.config.mts
import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "src"),
			"@": path.resolve(__dirname, "src")
		}
	}
});
