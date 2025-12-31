// noinspection ES6PreferShortImport

import type { ModuleOptions as PwaModuleOptions } from "@vite-pwa/nuxt";
import process from "node:process";
import { appDescription, appName } from "../constants";

const scope = "/";
export const devSwEnabled = process.env.NODE_ENV === "development" && process.env.PWA_DEV_SW === "true";

type StrictPwaOptions = PwaModuleOptions & {
	manifest: Exclude<PwaModuleOptions["manifest"], false | undefined>;
	workbox: Exclude<PwaModuleOptions["workbox"], false | undefined>;
};

export const pwa: StrictPwaOptions = {
	// Keep enabled; minify off to avoid terser failures in CI/npm builds.
	disable: false,
	minify: false,
	registerType: "autoUpdate",
	scope,
	base: scope,
	manifest: {
		id: scope,
		scope,
		name: appName,
		short_name: appName,
		description: appDescription,
		theme_color: "#ffffff",
		icons: [
			{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
			{ src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
			{ src: "maskable-icon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
		]
	},
	workbox: {
		globPatterns: ["**/*.{js,css,html,txt,png,ico,svg}"],
		navigateFallbackDenylist: [/^\/api\//],
		navigateFallback: "/",
		cleanupOutdatedCaches: true
	},
	registerWebManifestInRouteRules: true,
	writePlugin: true,
	devOptions: {
		enabled: devSwEnabled,
		navigateFallback: scope,
		suppressWarnings: true,
		disableRuntimeConfig: true
	}
};
