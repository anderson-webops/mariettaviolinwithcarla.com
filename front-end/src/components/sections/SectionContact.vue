<script setup lang="ts">
import { storeToRefs } from "pinia";
// import { computed, ref } from "vue";
import { ref } from "vue";
import { useSiteStore } from "~/stores/site";

const site = useSiteStore();
// const { contact, trial, contactForm } = storeToRefs(site);
const { trial, contactForm } = storeToRefs(site);

/* const trialMailto = computed(() => {
	return `mailto:${contact.value.email}?subject=${encodeURIComponent(trial.value.primarySubject)}`;
});
const smsHref = computed(() => contact.value.phoneHref.replace(/^tel:/, "sms:")); */

const formStatus = ref<"idle" | "sending" | "success">("idle");
const hasSubmitted = ref(false);

function handleSubmit() {
	hasSubmitted.value = true;
	formStatus.value = "sending";
}

function handleIframeLoad() {
	if (!hasSubmitted.value) return;
	formStatus.value = "success";
}
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
		</div>

		<iframe
			name="basin-iframe"
			title="Basin submission target"
			class="hidden"
			aria-hidden="true"
			tabindex="-1"
			@load="handleIframeLoad"
		/>

		<form
			id="form"
			class="space-y-4 rounded-2xl bg-white/90 p-5 shadow-md shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40"
			method="POST"
			:action="contactForm.action"
			enctype="multipart/form-data"
			target="basin-iframe"
			:aria-busy="formStatus === 'sending'"
			@submit="handleSubmit"
		>
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

			<div class="flex">
				<button
					type="submit"
					class="mx-auto inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5 hover:shadow-amber-600/60 disabled:cursor-wait disabled:opacity-70"
					:disabled="formStatus === 'sending'"
				>
					{{ contactForm.submitLabel }}
					<span class="i-carbon-email text-base" />
				</button>
			</div>
			<p v-if="formStatus === 'success'" class="text-xs font-semibold text-emerald-700">
				Thanks! Your message has been sent.
			</p>
		</form>
	</section>
</template>
