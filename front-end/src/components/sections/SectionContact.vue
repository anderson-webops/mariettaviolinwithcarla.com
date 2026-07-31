<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onBeforeUnmount, ref } from "vue";
import { useSiteStore } from "~/stores/site";

const site = useSiteStore();
const { contact, trial, contactForm } = storeToRefs(site);
const formStatus = ref<"idle" | "sending" | "submitted" | "uncertain">("idle");
const hasSubmitted = ref(false);
let responseTimer: ReturnType<typeof setTimeout> | undefined;

function handleSubmit() {
	hasSubmitted.value = true;
	formStatus.value = "sending";
	clearTimeout(responseTimer);
	responseTimer = setTimeout(() => {
		formStatus.value = "uncertain";
	}, 15_000);
}

function handleIframeLoad() {
	if (!hasSubmitted.value) return;
	clearTimeout(responseTimer);
	formStatus.value = "submitted";
}

onBeforeUnmount(() => clearTimeout(responseTimer));
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
			referrerpolicy="no-referrer"
			sandbox="allow-forms"
			@load="handleIframeLoad"
		/>

		<form
			id="form"
			class="space-y-4 rounded-2xl bg-white/90 p-5 shadow-md shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40"
			method="POST"
			:action="contactForm.action"
			accept-charset="UTF-8"
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
				<label
					class="block text-xs font-semibold uppercase tracking-[0.16em] text-amber-700"
					:for="`contact-${field.name}`"
				>
					{{ field.label }}
				</label>
				<input
					v-if="field.type !== 'textarea'"
					:id="`contact-${field.name}`"
					:type="field.type"
					:name="field.name"
					:autocomplete="field.autocomplete"
					:maxlength="field.maxLength"
					class="w-full rounded-lg border border-amber-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-amber-900/50 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-amber-400 dark:focus:ring-amber-900/40"
					:required="field.required"
				/>
				<textarea
					v-else
					:id="`contact-${field.name}`"
					:name="field.name"
					:autocomplete="field.autocomplete"
					:maxlength="field.maxLength"
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
			<p class="text-xs text-slate-600 dark:text-slate-300">
				{{ contactForm.privacyNote }}
			</p>
			<p v-if="formStatus === 'submitted'" role="status" class="text-xs font-semibold text-emerald-700">
				{{ contactForm.submittedNote }}
			</p>
			<p v-else-if="formStatus === 'uncertain'" role="alert" class="text-xs font-semibold text-amber-800">
				{{ contactForm.uncertainNote }}
				<a class="underline" :href="`mailto:${contact.email}`">Email Carla</a>
				or <a class="underline" :href="contact.phoneHref">call {{ contact.phoneDisplay }}</a
				>.
			</p>
		</form>
	</section>
</template>
