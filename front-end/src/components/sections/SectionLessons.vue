<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSiteStore } from "~/stores/site";

const { lessons } = storeToRefs(useSiteStore());
</script>

<template>
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
</template>
