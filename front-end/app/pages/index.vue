<script setup lang="ts">
definePageMeta({
	layout: "home"
});

const contactEmail = "lessons@mariettaviolin.com";
const phoneNumber = "(770) 555-1717";
const phoneHref = "tel:+17705551717";

const highlights = [
	{
		title: "Patient, musical teaching",
		copy: "Carla blends Suzuki foundations with creative repertoire so students build confident tone, intonation, and musicianship at every age.",
		icon: "i-carbon-music"
	},
	{
		title: "Clear weekly practice plans",
		copy: "Each lesson ends with a written plan and audio clips for home practice. Parents get simple notes to keep progress steady.",
		icon: "i-carbon-notebook"
	},
	{
		title: "Perform with ease",
		copy: "Studio classes and twice-yearly recitals help students feel comfortable performing, auditioning, and leading in orchestra.",
		icon: "i-carbon-star-review"
	}
];

const lessonOptions = [
	{
		name: "30-minute weekly",
		description: "Perfect for new players and young students. Gentle pace, lots of games, and posture-focused fundamentals.",
		format: "In-person or online"
	},
	{
		name: "45-minute weekly",
		description: "For growing students who want room for scales, etudes, and recital prep with meaningful feedback.",
		format: "In-person or online"
	},
	{
		name: "60-minute coaching",
		description: "Audition and ensemble prep, chair challenges, All-State, or polishing solo repertoire with detailed guidance.",
		format: "In-person or online"
	}
];

const studioNotes = [
	{
		label: "Where",
		value: "Marietta (East Cobb), near Roswell Rd & Johnson Ferry. Cozy home studio with quiet, dedicated practice space.",
		icon: "i-carbon-location"
	},
	{
		label: "How we meet",
		value: "In-person or Zoom. Clean copies of music, recordings, and practice notes provided after each lesson.",
		icon: "i-carbon-calendar"
	},
	{
		label: "Who I teach",
		value: "Beginners (age 6+), middle/high school orchestra students, and motivated adult learners.",
		icon: "i-carbon-user-multiple"
	}
];

const studentSupport = [
	"Weekly lesson notes emailed to students and parents",
	"Two studio recitals each year with pianist provided",
	"Studio classes for sight-reading and ensemble skills",
	"Audition prep for chamber groups, youth orchestra, and All-State",
	"Digital practice journal templates available on request"
];
</script>

<template>
	<section class="grid gap-12 text-left">
		<div class="rounded-3xl bg-white/85 p-8 shadow-xl shadow-amber-200/60 ring-1 ring-amber-100/60 backdrop-blur-sm dark:bg-slate-900/70 dark:ring-amber-900/30">
			<div class="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
				<div class="space-y-5">
					<p class="text-[11px] uppercase tracking-[0.32em] text-amber-700 font-semibold">Marietta, Georgia</p>
					<h1 class="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl sm:leading-tight dark:text-white">
						Violin lessons with Carla — warm, encouraging, and tailored to every student.
					</h1>
					<p class="text-lg text-slate-700 dark:text-slate-200">
						Whether you're picking up the violin for the first time or preparing for an audition, Carla's studio pairs clear fundamentals with musicality and performance confidence.
					</p>
					<div class="flex flex-wrap gap-3">
						<a class="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5 hover:shadow-amber-600/60" :href="`mailto:${contactEmail}?subject=Lesson%20inquiry`">
							Schedule a lesson
							<span class="i-carbon-arrow-right text-base" />
						</a>
						<a class="inline-flex items-center gap-2 rounded-full border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:-translate-y-0.5 hover:border-amber-400 dark:border-amber-900/60 dark:text-amber-200" :href="phoneHref">
							Call or text {{ phoneNumber }}
						</a>
					</div>
					<div class="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
						<span class="rounded-full bg-amber-100 px-3 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">Beginner to advanced</span>
						<span class="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">In-person + online</span>
						<span class="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">Studio recitals</span>
					</div>
				</div>

				<div class="grid gap-4 rounded-2xl bg-gradient-to-br from-white to-amber-50/80 p-6 shadow-inner ring-1 ring-amber-100/70 dark:from-slate-800 dark:to-slate-900 dark:ring-amber-900/40">
					<div v-for="item in highlights" :key="item.title" class="flex gap-4 rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-amber-100/70 dark:bg-slate-900/70 dark:ring-amber-900/40">
						<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40">
							<span :class="item.icon" class="text-xl" aria-hidden="true" />
						</div>
						<div class="space-y-1">
							<p class="text-base font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
							<p class="text-sm text-slate-700 dark:text-slate-200">{{ item.copy }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<section id="lessons" class="grid gap-6 md:grid-cols-3">
			<div v-for="option in lessonOptions" :key="option.name" class="flex h-full flex-col gap-3 rounded-2xl bg-white/90 p-6 shadow-md shadow-amber-100/70 ring-1 ring-amber-100/70 dark:bg-slate-900/70 dark:ring-amber-900/40">
				<p class="text-sm uppercase tracking-[0.22em] text-amber-700 font-semibold">{{ option.name }}</p>
				<p class="text-base font-semibold text-slate-900 dark:text-white">{{ option.description }}</p>
				<p class="text-sm text-slate-600 dark:text-slate-300">{{ option.format }}</p>
			</div>
		</section>

		<section id="studio" class="grid gap-6 rounded-3xl bg-white/90 p-7 shadow-lg shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40 md:grid-cols-3">
			<div v-for="note in studioNotes" :key="note.label" class="flex gap-4 rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-100/70 dark:bg-amber-900/20 dark:ring-amber-900/40">
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-amber-800 shadow-sm ring-1 ring-amber-100/80 dark:bg-slate-900 dark:text-amber-100 dark:ring-amber-900/50">
					<span :class="note.icon" class="text-xl" aria-hidden="true" />
				</div>
				<div class="space-y-1">
					<p class="text-sm uppercase tracking-[0.18em] text-amber-800 font-semibold">{{ note.label }}</p>
					<p class="text-sm text-slate-800 dark:text-slate-200">{{ note.value }}</p>
				</div>
			</div>
		</section>

		<section id="students" class="grid gap-6 rounded-3xl bg-white/90 p-7 shadow-lg shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40 md:grid-cols-[1.2fr_0.8fr] md:items-center">
			<div class="space-y-3">
				<p class="text-[11px] uppercase tracking-[0.28em] text-amber-700 font-semibold">Current students</p>
				<h2 class="text-2xl font-semibold text-slate-900 dark:text-white">What to expect each week</h2>
				<ul class="grid gap-2 text-sm text-slate-700 dark:text-slate-200">
					<li v-for="item in studentSupport" :key="item" class="flex items-start gap-2">
						<span class="mt-0.5 h-2 w-2 rounded-full bg-amber-600" />
						<span>{{ item }}</span>
					</li>
				</ul>
			</div>
			<div class="rounded-2xl bg-gradient-to-br from-amber-700 to-amber-500 p-6 text-white shadow-xl">
				<p class="text-sm uppercase tracking-[0.24em] font-semibold">Need something?</p>
				<h3 class="mt-2 text-xl font-semibold">Parent & student quick help</h3>
				<p class="mt-2 text-sm text-amber-50/90">Email Carla if you need a fresh practice plan, recordings, or to reschedule.</p>
				<div class="mt-4 flex flex-wrap gap-3 text-sm">
					<a class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-amber-800 shadow-md shadow-amber-900/40 transition hover:-translate-y-0.5" :href="`mailto:${contactEmail}?subject=Practice%20plan%20request`">
						Request notes
						<span class="i-carbon-email text-base" />
					</a>
					<a class="inline-flex items-center gap-2 rounded-full border border-white/60 px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5" :href="phoneHref">
						Text Carla
						<span class="i-carbon-mobile text-base" />
					</a>
				</div>
			</div>
		</section>

		<section id="contact" class="grid gap-6 rounded-3xl bg-white/90 p-7 shadow-lg shadow-amber-100/60 ring-1 ring-amber-100/60 dark:bg-slate-900/70 dark:ring-amber-900/40 md:grid-cols-2 md:items-center">
			<div class="space-y-3">
				<p class="text-[11px] uppercase tracking-[0.28em] text-amber-700 font-semibold">Ready to begin?</p>
				<h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Set up a trial lesson</h2>
				<p class="text-sm text-slate-700 dark:text-slate-200">
					Tell me a bit about the student, experience level, and times that work best. We'll set a relaxed trial lesson and send you a simple practice outline afterward.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<a class="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5 hover:shadow-amber-600/60" :href="`mailto:${contactEmail}?subject=Trial%20lesson%20request`">
					Email Carla
					<span class="i-carbon-email text-base" />
				</a>
				<a class="inline-flex items-center gap-2 rounded-full border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:-translate-y-0.5 hover:border-amber-400 dark:border-amber-900/60 dark:text-amber-200" :href="phoneHref">
					Call or text {{ phoneNumber }}
				</a>
			</div>
		</section>
	</section>
</template>
