<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSiteStore } from "~/stores/site";

const { studio } = storeToRefs(useSiteStore());
</script>

<template>
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
</template>
