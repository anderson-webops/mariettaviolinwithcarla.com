<script setup lang="ts">
// noinspection ES6PreferShortImport
import { appDescription, appName } from "@/constants";

useHead({
	title: appName,
	meta: [
		{ name: "description", content: appDescription },
		{ property: "og:title", content: appName },
		{ property: "og:description", content: appDescription }
	]
});
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<style>
/*noinspection ALL*/
html,
body,
#__nuxt {
	height: 100vh;
	margin: 0;
	padding: 0;
}

/*noinspection ALL*/
html.dark {
	color-scheme: dark;
}
</style>
