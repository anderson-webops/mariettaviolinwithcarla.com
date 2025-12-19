<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSiteStore } from "~/stores/site";

const site = useSiteStore();
const { students } = storeToRefs(site);
</script>

<template>
	<section
		id="students"
		class="grid gap-6 rounded-3xl bg-white/90 p-7 shadow-lg shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40 md:grid-cols-2 md:items-center"
	>
		<div
			class="order-2 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-500 p-6 text-white shadow-xl md:order-1 w-full md:w-fit md:justify-self-start"
		>
			<ul class="grid gap-2 text-sm text-amber-50/95">
				<li v-for="item in students.support" :key="item" class="flex items-start gap-2">
					<span class="mt-0.5 h-2 w-2 rounded-full bg-white/90" />
					<span>{{ item }}</span>
				</li>
			</ul>
		</div>
		<div class="order-1 space-y-3 md:order-2">
			<p class="text-[11px] uppercase tracking-[0.28em] text-amber-700 font-semibold">
				{{ students.eyebrow }}
			</p>
			<h2 class="text-2xl font-semibold text-slate-900 dark:text-white">{{ students.title }}</h2>
			<p class="text-sm text-slate-700 dark:text-slate-200">
				{{ students.body }}
			</p>
		</div>
	</section>
</template>
