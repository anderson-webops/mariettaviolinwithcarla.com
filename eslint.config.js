// ./eslint.config.js -- monorepo root
import antfu from "@antfu/eslint-config";


export default antfu({
	root: true, // the one and only "root"
	env: { browser: true, node: true, es2021: true },
	stylistic: { indent: "tab", quotes: "double", semi: true, linebreak: "unix" },
	
	/* this section is passed straight to eslint-plugin-prettier */
	formatters: {
		prettier: {
			tabWidth: 4, //  <- the bit you asked for
			useTabs: true, //  <- make Prettier treat "\t" as 1 indent unit
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
		"style/comma-dangle": "off"
	}
	// …any repo-wide rules you genuinely want everywhere…
});
