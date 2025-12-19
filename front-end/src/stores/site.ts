import { defineStore } from "pinia";
import { computed } from "vue";
import siteContent from "@/content/site.json";

type ColorModePreference = "light" | "dark" | "system";

interface Tag {
	label: string;
	tone: "amber" | "emerald" | "slate";
}

interface Highlight {
	title: string;
	copy: string;
	icon: string;
}

interface HeroContent {
	location: string;
	headline: string;
	body: string;
	primaryCta: {
		label: string;
		emailSubject: string;
	};
	secondaryCta: {
		label: string;
	};
	tags: Tag[];
	highlights: Highlight[];
}

interface LessonOption {
	name: string;
	description: string;
	format: string;
}

interface StudioNote {
	label: string;
	value: string;
	icon: string;
}

interface StudentCtaCard {
	eyebrow: string;
	title: string;
	body: string;
	emailSubject: string;
	primaryLabel: string;
	secondaryLabel: string;
}

interface StudentsContent {
	eyebrow: string;
	title: string;
	support: string[];
	ctaCard: StudentCtaCard;
}

interface TrialContent {
	eyebrow: string;
	title: string;
	body: string;
	primaryLabel: string;
	primarySubject: string;
	secondaryLabel: string;
}

interface ContactFormField {
	name: string;
	label: string;
	type: "text" | "email" | "textarea";
	required?: boolean;
}

interface ContactFormContent {
	action: string;
	title: string;
	body: string;
	submitLabel: string;
	fields: ContactFormField[];
}

interface AnnouncementContent {
	enabled: boolean;
	message: string;
	ctaLabel: string;
	ctaHref: string;
}

interface SiteContent {
	site: {
		name: string;
		description: string;
		label: string;
	};
	settings: {
		colorModeDefault: ColorModePreference;
	};
	announcement: AnnouncementContent;
	contact: {
		email: string;
		callLabel: string;
		textLabel: string;
		phoneDisplay: string;
		phoneHref: string;
	};
	hero: HeroContent;
	lessons: {
		cards: LessonOption[];
	};
	studio: {
		notes: StudioNote[];
	};
	students: StudentsContent;
	trial: TrialContent;
	contactForm: ContactFormContent;
	footer: {
		eyebrow: string;
		body: string;
	};
}

function normalizeColorMode(preference?: string): ColorModePreference {
	if (preference === "dark" || preference === "system") return preference;
	return "light";
}

export const useSiteStore = defineStore("site", () => {
	const content = computed<SiteContent>(() => siteContent as SiteContent);

	const colorModeDefault = computed<ColorModePreference>(() =>
		normalizeColorMode(content.value.settings?.colorModeDefault)
	);

	return {
		content,
		site: computed(() => content.value.site),
		settings: computed(() => content.value.settings),
		contact: computed(() => content.value.contact),
		hero: computed(() => content.value.hero),
		lessons: computed(() => content.value.lessons),
		studio: computed(() => content.value.studio),
		students: computed(() => content.value.students),
		trial: computed(() => content.value.trial),
		contactForm: computed(() => content.value.contactForm),
		announcement: computed(() => content.value.announcement),
		footer: computed(() => content.value.footer),
		colorModeDefault
	};
});
