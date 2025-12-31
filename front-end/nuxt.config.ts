// noinspection ES6PreferShortImport

import type { ModuleOptions as ColorModeOptions } from "@nuxtjs/color-mode";
import type { ModuleOptions as PwaModuleOptions } from "@vite-pwa/nuxt";
import type { NuxtConfig } from "nuxt/schema";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";
import { devSwEnabled, pwa } from "./src/config/pwa";
import { appDescription } from "./src/constants";
import siteContent from "./src/content/site.json";

const isDev = process.env.NODE_ENV === "development";
const enablePwaEnv = process.env.ENABLE_PWA === "true" || process.env.VITE_PLUGIN_PWA === "true";
const enablePwa = enablePwaEnv && (!isDev || devSwEnabled);

const __dirname: string = path.dirname(fileURLToPath(import.meta.url));
const srcPath: string = path.resolve(__dirname, "src");
const srcAlias = `${srcPath}/`;
const manifestLinks = enablePwa ? [{ rel: "manifest", href: "/manifest.webmanifest" }] : [];

type ExtendedNuxtConfig = NuxtConfig & {
	colorMode?: Partial<ColorModeOptions>;
	pwa?: PwaModuleOptions | false;
};

type ColorModePreference = "light" | "dark" | "system";
const contentColorPreference =
	(siteContent as { settings?: { colorModeDefault?: ColorModePreference } }).settings?.colorModeDefault ?? "light";
const colorModeFallback = contentColorPreference === "system" ? "light" : contentColorPreference;

export default defineNuxtConfig({
	alias: {
		"~": srcAlias,
		"@": srcAlias
	},

	modules: ["@vueuse/nuxt", "@unocss/nuxt", "@pinia/nuxt", "@nuxtjs/color-mode", "@vite-pwa/nuxt", "@nuxt/eslint"],

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
				{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
				...manifestLinks
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

	runtimeConfig: {
		public: {
			pwaDevSw: devSwEnabled
		}
	},

	colorMode: {
		preference: contentColorPreference,
		fallback: colorModeFallback,
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
			ignore: []
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

	pwa: { ...pwa, disable: !enablePwa },
	vite: {
		resolve: {
			alias: {
				"~": srcPath,
				"@": srcPath
			}
		}
	}
} as ExtendedNuxtConfig) as ExtendedNuxtConfig;
