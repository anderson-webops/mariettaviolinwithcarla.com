// noinspection ES6PreferShortImport

import type { ModuleOptions as ColorModeOptions } from "@nuxtjs/color-mode";
import type { NuxtConfig } from "nuxt/schema";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";
import { appDescription } from "./src/constants";
import siteContent from "./src/content/site.json";

const __dirname: string = path.dirname(fileURLToPath(import.meta.url));
const srcPath: string = path.resolve(__dirname, "src");
const srcAlias = `${srcPath}/`;
const workspaceRoot = path.resolve(__dirname, "..");
const viteFsAllow = [srcPath, __dirname, workspaceRoot];

type ExtendedNuxtConfig = NuxtConfig & {
	colorMode?: Partial<ColorModeOptions>;
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

	modules: ["@unocss/nuxt", "@pinia/nuxt", "@nuxtjs/color-mode", "@nuxt/eslint"],

	srcDir: "src",

	devtools: {
		enabled: process.env.NODE_ENV === "development"
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
			],
			script:
				process.env.NODE_ENV === "development"
					? []
					: [
							{
								defer: true,
								src: "https://analytics.mariettaviolinwithcarla.com/script.js",
								"data-domains": "mariettaviolinwithcarla.com",
								"data-website-id": "a0761af6-a9e2-4937-b976-b3ac849d0ff4"
							}
						]
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
		// Safe to enable for static output now that the site no longer ships a service worker.
		payloadExtraction: true,
		renderJsonPayloads: true,
		typedPages: true
	},

	compatibilityDate: "2026-07-29",

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

	vite: {
		build: {
			modulePreload: {
				// Avoid Vite 7's polyfill transform, which emits a sourcemap warning in Nuxt builds.
				polyfill: false
			}
		},
		resolve: {
			alias: {
				"~": srcPath,
				"@": srcPath
			}
		},
		server: {
			fs: {
				allow: viteFsAllow
			}
		}
	}
} as ExtendedNuxtConfig) as ExtendedNuxtConfig;
