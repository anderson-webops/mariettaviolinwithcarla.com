<script setup lang="ts">
// noinspection ES6PreferShortImport
import { appDescription, appName } from "@/constants";
const siteUrl = "https://mariettaviolinwithcarla.com";
const route = useRoute();
const canonicalUrl = computed(() => new URL(route.path || "/", `${siteUrl}/`).toString());
const structuredData = [
	{
		"@context": "https://schema.org",
		"@type": "MusicSchool",
		"description": appDescription,
		"name": appName,
		"url": siteUrl
	},
	{
		"@context": "https://schema.org",
		"@type": "WebSite",
		"description": appDescription,
		"name": appName,
		"url": siteUrl
	}
];

useHead(() => ({
	title: appName,
	meta: [
		{ name: "description", content: appDescription },
		{ property: "og:title", content: appName },
		{ property: "og:description", content: appDescription },
		{ property: "og:type", content: "website" },
		{ property: "og:url", content: canonicalUrl.value },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: appName },
		{ name: "twitter:description", content: appDescription }
	],
	link: [
		{
			rel: "canonical",
			href: canonicalUrl.value
		}
	],
	script: structuredData.map((entry, index) => ({
		children: JSON.stringify(entry),
		key: `structured-data-${index}`,
		type: "application/ld+json"
	}))
}));
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
