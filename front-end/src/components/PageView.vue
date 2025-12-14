<script setup lang="ts">
type PageviewResponse = {
	pageview: number;
	startAt: string | number | Date;
};

const { data } = await useFetch<PageviewResponse>("/api/pageview");

const time = useTimeAgo(() => data.value?.startAt || 0);
</script>

<template>
	<div class="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
		<span class="font-semibold text-slate-800 dark:text-slate-100">{{ data?.pageview }}</span>
		<span>page views since</span>
		<span class="text-slate-700 dark:text-slate-200">{{ time }}</span>
	</div>
</template>
