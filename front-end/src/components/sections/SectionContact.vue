<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useSiteStore } from "~/stores/site";

const site = useSiteStore();
const { contact, trial } = storeToRefs(site);
// const { contact, trial, contactForm } = storeToRefs(site);

const trialMailto = computed(() => {
	return `mailto:${contact.value.email}?subject=${encodeURIComponent(trial.value.primarySubject)}`;
});
</script>

<template>
	<section
		id="contact"
		class="grid gap-6 rounded-3xl bg-white/90 p-7 shadow-lg shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40 md:grid-cols-2 md:items-center"
	>
		<div class="space-y-3">
			<p class="text-[11px] uppercase tracking-[0.28em] text-amber-700 font-semibold">{{ trial.eyebrow }}</p>
			<h2 class="text-2xl font-semibold text-slate-900 dark:text-white">{{ trial.title }}</h2>
			<p class="text-sm text-slate-700 dark:text-slate-200">
				{{ trial.body }}
			</p>
			<div class="flex flex-wrap gap-3">
				<a
					class="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5 hover:shadow-amber-600/60"
					:href="trialMailto"
				>
					{{ trial.primaryLabel }}
					<span class="i-carbon-email text-base" />
				</a>
				<a
					class="inline-flex items-center gap-2 rounded-full border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:-translate-y-0.5 hover:border-amber-400 dark:border-amber-900/60 dark:text-amber-200"
					:href="contact.phoneHref"
				>
					{{ trial.secondaryLabel }} {{ contact.phoneDisplay }}
				</a>
			</div>
		</div>

		<!--		<form
			class="space-y-4 rounded-2xl bg-white/90 p-5 shadow-md shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40"
			name="lesson-request"
			method="POST"
			data-netlify="true"
			data-netlify-honeypot="bot-field"
		>
			<input type="hidden" name="form-name" value="lesson-request" />
			<p class="sr-only">
				<label>
					Don’t fill this out if you're human:
					<input name="bot-field" />
				</label>
			</p>

			<div class="space-y-1">
				<p class="text-sm font-semibold text-slate-900 dark:text-white">{{ contactForm.title }}</p>
				<p class="text-xs text-slate-700 dark:text-slate-200">{{ contactForm.body }}</p>
			</div>

			<div v-for="field in contactForm.fields" :key="field.name" class="space-y-1">
				<label class="block text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
					{{ field.label }}
				</label>
				<input
					v-if="field.type !== 'textarea'"
					:type="field.type"
					:name="field.name"
					class="w-full rounded-lg border border-amber-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-amber-900/50 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-amber-400 dark:focus:ring-amber-900/40"
					:required="field.required"
				/>
				<textarea
					v-else
					:name="field.name"
					rows="3"
					class="w-full rounded-lg border border-amber-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-amber-900/50 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-amber-400 dark:focus:ring-amber-900/40"
					:required="field.required"
				/>
			</div>

			<div class="flex flex-wrap gap-3">
				<button
					type="submit"
					class="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5 hover:shadow-amber-600/60"
				>
					{{ contactForm.submitLabel }}
					<span class="i-carbon-email text-base" />
				</button>
				<a
					class="inline-flex items-center gap-2 rounded-full border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:-translate-y-0.5 hover:border-amber-400 dark:border-amber-900/60 dark:text-amber-200"
					:href="contact.phoneHref"
				>
					{{ trial.secondaryLabel }} {{ contact.phoneDisplay }}
				</a>
			</div>
		</form> -->
	</section>
</template>
