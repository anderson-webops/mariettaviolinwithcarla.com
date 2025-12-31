import type { ModuleOptions as ColorModeOptions } from "@nuxtjs/color-mode";
import type { ModuleOptions as PwaModuleOptions } from "@vite-pwa/nuxt";

declare module "@nuxt/schema" {
	interface ConfigSchema {
		colorMode?: Partial<ColorModeOptions>;
		pwa?: PwaModuleOptions | false;
	}

	interface NuxtConfig {
		colorMode?: Partial<ColorModeOptions>;
		pwa?: PwaModuleOptions | false;
	}

	interface NuxtOptions {
		colorMode?: Partial<ColorModeOptions>;
		pwa?: PwaModuleOptions | false;
	}
}

declare module "nuxt/schema" {
	interface ConfigSchema {
		colorMode?: Partial<ColorModeOptions>;
		pwa?: PwaModuleOptions | false;
	}

	interface NuxtConfig {
		colorMode?: Partial<ColorModeOptions>;
		pwa?: PwaModuleOptions | false;
	}

	interface NuxtOptions {
		colorMode?: Partial<ColorModeOptions>;
		pwa?: PwaModuleOptions | false;
	}
}

export {};
