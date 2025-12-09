<template>
	<div class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
		<div class="absolute inset-0 pointer-events-none select-none opacity-40 mix-blend-multiply blur-3xl dark:opacity-30" aria-hidden="true">
			<div class="absolute -left-24 top-10 h-64 w-64 rounded-full bg-amber-200" />
			<div class="absolute right-0 top-32 h-72 w-72 rounded-full bg-emerald-200" />
			<div class="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/60" />
		</div>

		<header class="relative z-10 container mx-auto flex items-center justify-between gap-6 px-6 py-6">
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl shadow-md shadow-amber-200/80 dark:bg-amber-900/40">
					<span aria-label="Violin emoji" role="img">🎻</span>
				</div>
				<div class="leading-tight">
					<p class="text-[11px] uppercase tracking-[0.3em] text-amber-700 font-semibold">Violin studio</p>
					<p class="text-lg font-semibold text-slate-900 dark:text-white">Marietta Violin with Carla</p>
				</div>
			</div>

			<nav class="hidden items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-200 md:flex">
				<a class="hover:text-amber-700" href="#lessons">Lessons</a>
				<a class="hover:text-amber-700" href="#studio">Studio</a>
				<a class="hover:text-amber-700" href="#students">Students</a>
				<a class="hover:text-amber-700" href="#contact">Contact</a>
			</nav>

			<div class="flex items-center gap-3 text-sm">
				<a class="inline-flex items-center gap-2 rounded-full bg-amber-700 px-4 py-2 font-semibold text-white shadow-lg shadow-amber-500/40 transition hover:-translate-y-0.5 hover:shadow-amber-600/50" href="mailto:lessons@mariettaviolin.com">
					Schedule a lesson
					<span class="i-carbon-arrow-right text-base" />
				</a>
				<a class="hidden text-amber-800 underline-offset-4 hover:underline dark:text-amber-200 sm:inline-flex" href="tel:+17705551717">
					Call: (770) 555-1717
				</a>
				<div class="ml-2">
					<DarkToggle />
				</div>
			</div>
		</header>

		<main class="relative z-10 container mx-auto px-6 pb-16 pt-2">
			<slot />
		</main>

		<div class="relative z-10 container mx-auto px-6 pb-10">
			<Footer />
		</div>
	</div>
</template>
