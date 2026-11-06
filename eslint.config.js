// ./eslint.config.js -- monorepo root
import antfu from "@antfu/eslint-config";

export default antfu({
	antislop: true,
	root: true, // the one and only "root"
	env: { browser: true, node: true, es2021: true },
	stylistic: {
		indent: "tab",
		quotes: "double",
		semi: true,
		linebreak: "unix"
	},

	formatters: {
		css: true,
		html: true,
		xml: true,
		prettierOptions: {
			tabWidth: 4,
			useTabs: true,
			trailingComma: "none",
			printWidth: 120,
			endOfLine: "lf"
		}
	},

	ignores: ["**/*.d.ts"], // ignore all generated declaration files
	rules: {
		"no-console": "off",
		// disable Antfu’s “expect newline after if” check:
		"antfu/if-newline": "off",
		"style/comma-dangle": "off",
		"test/no-import-node-test": "off"
	}
	// …any repo-wide rules you genuinely want everywhere…
});
