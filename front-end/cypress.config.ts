import process from "node:process";
import { defineConfig } from "cypress";

const baseUrl = process.env.CYPRESS_BASE_URL || "http://localhost:3333";

export default defineConfig({
	e2e: {
		baseUrl,
		setupNodeEvents() {
			// implement node event listeners here
		}
	},

	component: {
		devServer: {
			framework: "vue",
			bundler: "vite"
		}
	}
});
