<script setup lang="ts">
const name = ref("");

const router = useRouter();
function go() {
	if (name.value) router.push(`/hi/${encodeURIComponent(name.value)}`);
}
</script>

<template>
	<div>
		<input
			id="input"
			v-model="name"
			placeholder="What's your name?"
			type="text"
			autocomplete="off"
			class="mt-5 w-[250px] rounded border border-gray-200 bg-transparent px-4 py-2 text-center outline-none transition focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 dark:border-gray-700 dark:focus:ring-amber-400"
			@keydown.enter="go"
		/>
		<div>
			<button class="btn m-3 text-sm" :disabled="!name" @click="go">GO</button>
		</div>
	</div>
</template>
