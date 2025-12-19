<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useSiteStore } from "~/stores/site";

definePageMeta({
	layout: "home"
});

const site = useSiteStore();
const { contact, hero, lessons, studio, students, trial, contactForm } = storeToRefs(site);

const heroMailto = computed(() => {
	return `mailto:${contact.value.email}?subject=${encodeURIComponent(hero.value.primaryCta.emailSubject)}`;
});
const supportMailto = computed(() => {
	return `mailto:${contact.value.email}?subject=${encodeURIComponent(students.value.ctaCard.emailSubject)}`;
});
const trialMailto = computed(() => {
	return `mailto:${contact.value.email}?subject=${encodeURIComponent(trial.value.primarySubject)}`;
});

const tagToneClasses: Record<string, string> = {
	amber: "rounded-full bg-amber-100 px-3 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100",
	emerald: "rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
	slate: "rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
};
</script>

<template>
	<section class="grid gap-12 text-left">
		<div
			class="rounded-3xl bg-white/85 p-8 shadow-xl shadow-amber-200/60 ring-1 ring-amber-100/60 backdrop-blur-sm dark:bg-slate-900/70 dark:ring-amber-900/30"
		>
			<div class="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
				<div class="space-y-5">
					<p class="text-[11px] uppercase tracking-[0.32em] text-amber-700 font-semibold">
						{{ hero.location }}
					</p>
					<h1
						class="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl sm:leading-tight dark:text-white"
					>
						{{ hero.headline }}
					</h1>
					<p class="text-lg text-slate-700 dark:text-slate-200">
						{{ hero.body }}
					</p>
					<div class="flex flex-wrap gap-3">
						<a
							class="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5 hover:shadow-amber-600/60"
							:href="heroMailto"
						>
							{{ hero.primaryCta.label }}
							<span class="i-carbon-arrow-right text-base" />
						</a>
						<a
							class="inline-flex items-center gap-2 rounded-full border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:-translate-y-0.5 hover:border-amber-400 dark:border-amber-900/60 dark:text-amber-200"
							:href="contact.phoneHref"
						>
							{{ hero.secondaryCta.label }} {{ contact.phoneDisplay }}
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
		</div>

		<section id="lessons" class="grid gap-6 md:grid-cols-3">
			<div
				v-for="option in lessons.cards"
				:key="option.name"
				class="flex h-full flex-col gap-3 rounded-2xl bg-white/90 p-6 shadow-md shadow-amber-100/70 ring-1 ring-amber-100/70 dark:bg-slate-900/70 dark:ring-amber-900/40"
			>
				<p class="text-sm uppercase tracking-[0.22em] text-amber-700 font-semibold">
					{{ option.name }}
				</p>
				<p class="text-base font-semibold text-slate-900 dark:text-white">
					{{ option.description }}
				</p>
				<p class="text-sm text-slate-600 dark:text-slate-300">
					{{ option.format }}
				</p>
			</div>
		</section>

		<section
			id="studio"
			class="grid gap-6 rounded-3xl bg-white/90 p-7 shadow-lg shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40 md:grid-cols-3"
		>
			<div
				v-for="note in studio.notes"
				:key="note.label"
				class="flex gap-4 rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-100/70 dark:bg-amber-900/20 dark:ring-amber-900/40"
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-amber-800 shadow-sm ring-1 ring-amber-100/80 dark:bg-slate-900 dark:text-amber-100 dark:ring-amber-900/50"
				>
					<span :class="note.icon" class="text-xl" aria-hidden="true" />
				</div>
				<div class="space-y-1">
					<p class="text-sm uppercase tracking-[0.18em] text-amber-800 font-semibold">
						{{ note.label }}
					</p>
					<p class="text-sm text-slate-800 dark:text-slate-200">
						{{ note.value }}
					</p>
				</div>
			</div>
		</section>

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
						:href="contact.phoneHref"
					>
						{{ students.ctaCard.secondaryLabel }}
						<span class="i-carbon-mobile text-base" />
					</a>
				</div>
			</div>
		</section>

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
			</div>
			<form
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
			</form>
		</section>
	</section>
</template>
