<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import DarkToggle from "~/components/DarkToggle.vue";
import Footer from "~/components/Footer.vue";
import { useSiteStore } from "~/stores/site";

const site = useSiteStore();
const { site: siteInfo, contact } = storeToRefs(site);

const emailHref = computed(() => `mailto:${contact.value.email}`);
</script>

<template>
	<div
		class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50"
	>
		<header class="container mx-auto max-w-6xl flex items-center justify-between gap-4 px-6 py-6">
			<div class="flex items-center gap-3">
				<div
					class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-xl shadow-md shadow-amber-200/80 dark:bg-amber-900/40"
				>
					<span aria-label="Violin emoji" role="img">🎻</span>
				</div>
				<div class="leading-tight">
					<p class="text-[11px] uppercase tracking-[0.3em] text-amber-700 font-semibold">
						{{ siteInfo.label }}
					</p>
					<p class="text-base font-semibold text-slate-900 dark:text-white">
						{{ siteInfo.name }}
					</p>
				</div>
			</div>
			<div class="flex items-center gap-2 text-sm">
				<a
					class="hidden text-amber-800 underline-offset-4 hover:underline dark:text-amber-200 sm:inline-flex"
					:href="emailHref"
				>
					Email Carla
				</a>
				<DarkToggle />
			</div>
		</header>

		<main class="container mx-auto max-w-6xl px-6 pb-16">
			<slot />
		</main>
		<div class="container mx-auto max-w-6xl px-6 pb-10">
			<Footer />
		</div>
	</div>
</template>
