<script setup lang="ts">
import SectionContact from "~/components/sections/SectionContact.vue";
import SectionHero from "~/components/sections/SectionHero.vue";
import SectionLessons from "~/components/sections/SectionLessons.vue";
import SectionStudents from "~/components/sections/SectionStudents.vue";
import SectionStudio from "~/components/sections/SectionStudio.vue";

definePageMeta({
	layout: "home"
});
</script>

<template>
	<section class="grid gap-12 text-left">
		<SectionHero />
		<SectionLessons />
		<SectionStudio />
		<SectionStudents />
		<SectionContact />
	</section>
</template>
