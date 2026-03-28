import type { ModuleOptions as ColorModeOptions } from "@nuxtjs/color-mode";

declare module "@nuxt/schema" {
	interface ConfigSchema {
		colorMode?: Partial<ColorModeOptions>;
	}

	interface NuxtConfig {
		colorMode?: Partial<ColorModeOptions>;
	}

	interface NuxtOptions {
		colorMode?: Partial<ColorModeOptions>;
	}
}

declare module "nuxt/schema" {
	interface ConfigSchema {
		colorMode?: Partial<ColorModeOptions>;
	}

	interface NuxtConfig {
		colorMode?: Partial<ColorModeOptions>;
	}

	interface NuxtOptions {
		colorMode?: Partial<ColorModeOptions>;
	}
}

export {};
