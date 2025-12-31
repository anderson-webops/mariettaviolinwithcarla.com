import ppFlat from "eslint-config-prettier/flat";
import prettier from "eslint-plugin-prettier";
import vuePlugin from "eslint-plugin-vue";
import globals from "globals";
import ts from "typescript-eslint";
import vueParser from "vue-eslint-parser";
// front-end/eslint.config.js
import base from "../eslint.config.js"; // shared root config

export default base
	/* project-specific additions */
	.append({
		languageOptions: { globals: { ...globals.browser } },
		plugins: { prettier },
		rules: {
			"prettier/prettier": "error",
			"vue/multi-word-component-names": "off",
			"ts/no-explicit-any": "off",
			"no-undef": "off" // Nuxt auto-imported globals
		}
	})

	/* overrides ---------------------------------------------------- */
	.append(
		// TypeScript
		{
			files: ["**/*.ts"],
			languageOptions: {
				parser: ts.parser,
				parserOptions: { project: "./tsconfig.eslint.json", sourceType: "module" },
				globals: { ...globals.browser, ...globals.node }
			}
		},

		// Vue SFCs
		{
			files: ["**/*.vue"],
			plugins: { vue: vuePlugin },
			languageOptions: {
				parser: vueParser,
				parserOptions: {
					parser: ts.parser,
					extraFileExtensions: [".vue"]
				},
				globals: { ...globals.browser }
			},
			rules: { "vue/no-unused-vars": "off" }
		},

		// build / config scripts
		{
			files: ["**/*.{js,cjs,mjs}", "*.config.{js,ts}"],
			languageOptions: {
				sourceType: "module",
				globals: { ...globals.node, ...globals.browser }
			}
		},
		{
			files: ["test/**/*.test.ts"],
			languageOptions: {
				parser: ts.parser,
				parserOptions: { project: "./tsconfig.eslint.json", sourceType: "module" },
				globals: { ...globals.node }
			},
			rules: {
				"test/no-import-node-test": "off"
			}
		},
		{ ignores: [".nuxt/**", "dist/**", "src/layouts/README.md"] }
	)

	/* keep Prettier conflict-killer last */
	.append(ppFlat);
