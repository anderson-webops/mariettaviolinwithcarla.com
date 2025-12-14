// noinspection ES6PreferShortImport

import type { ModuleOptions as ColorModeOptions } from "@nuxtjs/color-mode";
import type { ModuleOptions as PwaModuleOptions } from "@vite-pwa/nuxt";
import type { NuxtConfig } from "nuxt/schema";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";
import { pwa } from "./src/config/pwa";
import { appDescription } from "./src/constants";

const enablePwa: boolean = process.env.ENABLE_PWA === "true";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ExtendedNuxtConfig = NuxtConfig & {
	colorMode?: Partial<ColorModeOptions>;
	pwa?: PwaModuleOptions | false;
};

export default defineNuxtConfig({
	alias: {
		"~": `${path.resolve(__dirname, "src")}/`,
		"@": `${path.resolve(__dirname, "src")}/`
	},

	modules: [
		"@vueuse/nuxt",
		"@unocss/nuxt",
		"@pinia/nuxt",
		"@nuxtjs/color-mode",
		enablePwa && "@vite-pwa/nuxt",
		"@nuxt/eslint"
	].filter(Boolean),

	srcDir: "src",

	devtools: {
		enabled: true
	},

	app: {
		head: {
			viewport: "width=device-width,initial-scale=1",
			link: [
				{ rel: "icon", href: "/favicon.ico", sizes: "any" },
				{ rel: "icon", type: "image/svg+xml", href: "/nuxt.svg" },
				{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" }
			],
			meta: [
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "description", content: appDescription },
				{ name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
				{ name: "theme-color", media: "(prefers-color-scheme: light)", content: "white" },
				{ name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#222222" }
			]
		}
	},

	colorMode: {
		classSuffix: ""
	},

	future: {
		compatibilityVersion: 4
	},

	experimental: {
		// when using generate, payload js assets included in sw precache manifest
		// but missing on offline, disabling extraction it until fixed
		payloadExtraction: false,
		renderJsonPayloads: true,
		typedPages: true
	},

	compatibilityDate: "2024-08-14",

	nitro: {
		esbuild: {
			options: {
				target: "esnext"
			}
		},
		prerender: {
			crawlLinks: false,
			routes: ["/"],
			ignore: ["/hi"]
		}
	},

	eslint: {
		config: {
			standalone: false,
			nuxt: {
				sortConfigKeys: true
			}
		}
	},

	pwa: { ...pwa, disable: !enablePwa }
} as ExtendedNuxtConfig) as ExtendedNuxtConfig;
