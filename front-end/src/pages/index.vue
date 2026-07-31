<script setup lang="ts">
import { storeToRefs } from "pinia";
import SectionContact from "~/components/sections/SectionContact.vue";
import SectionHero from "~/components/sections/SectionHero.vue";
import SectionLessons from "~/components/sections/SectionLessons.vue";
import SectionStudents from "~/components/sections/SectionStudents.vue";
import { serializeJsonLd } from "~/utils/serializeJsonLd";

definePageMeta({
	layout: "home"
});

const siteStore = useSiteStore();
const { contact, lessons, site } = storeToRefs(siteStore);
const faqEntries = computed(() => [
	{
		answer: "The studio welcomes beginners age 6 and up, middle and high school orchestra students, and motivated adult learners.",
		question: "Who are lessons designed for?"
	},
	{
		answer: "Lessons are available in person near Wheeler High in Marietta and online for families who need a remote option.",
		question: "Do you offer in-person and online lessons?"
	},
	{
		answer: "A relaxed trial lesson is the best starting point. Families can email, call, text, or use the lesson request form to get scheduling options.",
		question: "How do we get started?"
	}
]);

useHead(() => ({
	title: site.value.name,
	link: [
		{
			href: "https://mariettaviolinwithcarla.com/",
			rel: "canonical"
		}
	],
	script: [
		{
			innerHTML: serializeJsonLd({
				"@context": "https://schema.org",
				"@type": "MusicSchool",
				address: {
					"@type": "PostalAddress",
					addressLocality: "Marietta",
					addressRegion: "GA",
					postalCode: "30067",
					streetAddress: "2207 Clearwater Dr"
				},
				areaServed: ["Marietta", "East Cobb", "Atlanta"],
				description: site.value.description,
				email: contact.value.email,
				name: site.value.name,
				telephone: contact.value.phoneDisplay,
				url: "https://mariettaviolinwithcarla.com/"
			}),
			key: "music-school-jsonld",
			type: "application/ld+json"
		},
		{
			innerHTML: serializeJsonLd({
				"@context": "https://schema.org",
				"@type": "FAQPage",
				mainEntity: faqEntries.value.map((entry) => ({
					"@type": "Question",
					acceptedAnswer: {
						"@type": "Answer",
						text: entry.answer
					},
					name: entry.question
				}))
			}),
			key: "faq-jsonld",
			type: "application/ld+json"
		},
		{
			innerHTML: serializeJsonLd({
				"@context": "https://schema.org",
				"@type": "ItemList",
				itemListElement: lessons.value.cards.map((option, index) => ({
					"@type": "ListItem",
					name: option.name,
					position: index + 1
				})),
				name: `${site.value.name} lesson options`
			}),
			key: "lesson-list-jsonld",
			type: "application/ld+json"
		},
		{
			innerHTML: serializeJsonLd({
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						item: "https://mariettaviolinwithcarla.com/",
						name: site.value.name,
						position: 1
					}
				]
			}),
			key: "breadcrumb-jsonld",
			type: "application/ld+json"
		}
	]
}));
</script>

<template>
	<section class="grid gap-12 text-left">
		<SectionHero />
		<SectionLessons />
		<SectionStudents />
		<SectionContact />
	</section>
</template>
