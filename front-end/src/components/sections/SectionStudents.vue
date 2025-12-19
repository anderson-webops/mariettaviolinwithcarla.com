<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useSiteStore } from "~/stores/site";

const site = useSiteStore();
const { students, contact } = storeToRefs(site);

const supportMailto = computed(() => {
	return `mailto:${contact.value.email}?subject=${encodeURIComponent(students.value.ctaCard.emailSubject)}`;
});
const smsHref = computed(() => contact.value.phoneHref.replace(/^tel:/, "sms:"));
</script>

<template>
	<section
		id="students"
		class="grid gap-6 rounded-3xl bg-white/90 p-7 shadow-lg shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40 md:grid-cols-[1.2fr_0.8fr] md:items-center"
	>
		<div class="space-y-3">
			<p class="text-[11px] uppercase tracking-[0.28em] text-amber-700 font-semibold">
				{{ students.eyebrow }}
			</p>
			<h2 class="text-2xl font-semibold text-slate-900 dark:text-white">{{ students.title }}</h2>
			<ul class="grid gap-2 text-sm text-slate-700 dark:text-slate-200">
				<li v-for="item in students.support" :key="item" class="flex items-start gap-2">
					<span class="mt-0.5 h-2 w-2 rounded-full bg-amber-600" />
					<span>{{ item }}</span>
				</li>
			</ul>
		</div>
		<div class="rounded-2xl bg-gradient-to-br from-amber-700 to-amber-500 p-6 text-white shadow-xl">
			<p class="text-sm uppercase tracking-[0.24em] font-semibold">{{ students.ctaCard.eyebrow }}</p>
			<h3 class="mt-2 text-xl font-semibold">{{ students.ctaCard.title }}</h3>
			<p class="mt-2 text-sm text-amber-50/90">
				{{ students.ctaCard.body }}
			</p>
			<div class="mt-4 flex flex-wrap gap-3 text-sm">
				<a
					class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-amber-800 shadow-md shadow-amber-900/40 transition hover:-translate-y-0.5"
					:href="supportMailto"
				>
					{{ students.ctaCard.primaryLabel }}
					<span class="i-carbon-email text-base" />
				</a>
				<a
					class="inline-flex items-center gap-2 rounded-full border border-white/60 px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5"
					:href="smsHref"
				>
					{{ students.ctaCard.secondaryLabel }}
					<span class="i-carbon-mobile text-base" />
				</a>
			</div>
		</div>
	</section>
</template>
