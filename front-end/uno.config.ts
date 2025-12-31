import {
	defineConfig,
	presetAttributify,
	presetIcons,
	presetTypography,
	presetWind4,
	transformerDirectives,
	transformerVariantGroup
} from "unocss";

export default defineConfig({
	shortcuts: [
		[
			"btn",
			"px-4 py-1 rounded inline-block bg-amber-700 text-white cursor-pointer hover:bg-amber-800 disabled:cursor-default disabled:bg-amber-300 disabled:opacity-60"
		],
		[
			"icon-btn",
			"inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-amber-700"
		]
	],
	theme: {
		fontFamily: {
			sans: '"Inter","Avenir Next","Segoe UI",system-ui,-apple-system,sans-serif',
			serif: '"Georgia","Garamond","Times New Roman",serif',
			mono: '"DM Mono","SFMono-Regular",ui-monospace,monospace'
		},
		colors: {
			brand: "#b45309"
		}
	},
	presets: [
		presetWind4(),
		presetAttributify(),
		presetIcons({
			scale: 1.2
		}),
		presetTypography()
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
});
