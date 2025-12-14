<script setup lang="ts">
//noinspection ES6PreferShortImport
import { appDescription, appName } from "../../front-end/src/constants";

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
	<VitePwaManifest />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<style>
html,
body,
#__nuxt {
	height: 100vh;
	margin: 0;
	padding: 0;
}

html.dark {
	color-scheme: dark;
}
</style>
