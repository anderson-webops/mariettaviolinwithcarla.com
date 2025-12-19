<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useSiteStore } from "~/stores/site";

const site = useSiteStore();
const { hero, contact } = storeToRefs(site);

const heroMailto = computed(() => {
	return `mailto:${contact.value.email}?subject=${encodeURIComponent(hero.value.primaryCta.emailSubject)}`;
});

const smsHref = computed(() => contact.value.phoneHref.replace(/^tel:/, "sms:"));

const tagToneClasses: Record<string, string> = {
	amber: "rounded-full bg-amber-100 px-3 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100",
	emerald: "rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
	slate: "rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
};
</script>

<template>
	<section
		class="rounded-3xl bg-white/85 p-8 shadow-xl shadow-amber-200/60 ring-1 ring-amber-100/60 backdrop-blur-sm dark:bg-slate-900/70 dark:ring-amber-900/30"
	>
		<div class="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-stretch">
			<div class="flex h-full flex-col">
				<div class="flex-[0.5]" aria-hidden="true" />
				<div class="space-y-5">
					<p class="text-[11px] uppercase tracking-[0.32em] text-amber-700 font-semibold">
						{{ hero.location }}
					</p>
					<h1
						class="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl sm:leading-tight dark:text-white"
					>
						{{ hero.headline }}
					</h1>
					<p class="text-[16px] text-slate-700 dark:text-slate-200">
						{{ hero.body }}
					</p>
				</div>
				<div class="flex-1" aria-hidden="true" />
				<div class="space-y-4">
					<div class="flex flex-wrap gap-3">
						<a
							class="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5 hover:shadow-amber-600/60"
							:href="heroMailto"
						>
							{{ hero.primaryCta.label }}
							<span class="i-carbon-email text-base" />
						</a>
						<a
							class="inline-flex items-center gap-2 rounded-full border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:-translate-y-0.5 hover:border-amber-400 dark:border-amber-900/60 dark:text-amber-200"
							:href="contact.phoneHref"
						>
							{{ contact.callLabel }} {{ contact.phoneDisplay }}
							<span class="i-carbon-phone text-base" />
						</a>
						<a
							class="inline-flex items-center gap-2 rounded-full border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:-translate-y-0.5 hover:border-amber-400 dark:border-amber-900/60 dark:text-amber-200"
							:href="smsHref"
						>
							{{ contact.textLabel }} {{ contact.phoneDisplay }}
							<span class="i-carbon-chat text-base" />
						</a>
					</div>
					<div
						class="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300"
					>
						<span v-for="tag in hero.tags" :key="tag.label" :class="tagToneClasses[tag.tone]">
							{{ tag.label }}
						</span>
					</div>
				</div>
			</div>

			<div
				class="grid gap-4 rounded-2xl bg-gradient-to-br from-white to-amber-50/80 p-6 shadow-inner ring-1 ring-amber-100/70 dark:from-slate-800 dark:to-slate-900 dark:ring-amber-900/40"
			>
				<div
					v-for="item in hero.highlights"
					:key="item.title"
					class="flex gap-4 rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-amber-100/70 dark:bg-slate-900/70 dark:ring-amber-900/40"
				>
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40"
					>
						<span :class="item.icon" class="text-xl" aria-hidden="true" />
					</div>
					<div class="space-y-1">
						<p class="text-base font-semibold text-slate-900 dark:text-white">
							{{ item.title }}
						</p>
						<p class="text-sm text-slate-700 dark:text-slate-200">
							{{ item.copy }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
