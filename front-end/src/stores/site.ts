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

interface EditableStudentsContent {
	eyebrow: string;
	title: string;
	body: string;
	locationLabel: string;
	support: string[];
}

type StudentsContent = Omit<EditableStudentsContent, "locationLabel">;

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
	maxLength: number;
	autocomplete: string;
}

interface ContactFormContent {
	action: string;
	title: string;
	body: string;
	submitLabel: string;
	privacyNote: string;
	submittedNote: string;
	uncertainNote: string;
	fields: ContactFormField[];
}

interface AnnouncementContent {
	enabled: boolean;
	message: string;
	ctaLabel: string;
	ctaHref: string;
}

interface EditableContactContent {
	email: string;
	callLabel: string;
	textLabel: string;
	phoneDisplay: string;
}

interface ContactContent extends EditableContactContent {
	phoneHref: string;
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
	contact: EditableContactContent;
	hero: HeroContent;
	lessons: {
		cards: LessonOption[];
	};
	students: EditableStudentsContent;
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

export function telephoneHref(phoneDisplay: string): string {
	const digits = phoneDisplay.replace(/\D/g, "");

	if (digits.length === 10) return `tel:+1${digits}`;
	if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;

	return `tel:${phoneDisplay.replace(/\s/g, "")}`;
}

export const useSiteStore = defineStore("site", () => {
	const content = computed<SiteContent>(() => siteContent as SiteContent);

	const colorModeDefault = computed<ColorModePreference>(() =>
		normalizeColorMode(content.value.settings?.colorModeDefault)
	);
	const contact = computed<ContactContent>(() => ({
		...content.value.contact,
		phoneHref: telephoneHref(content.value.contact.phoneDisplay)
	}));
	const students = computed<StudentsContent>(() => {
		const { locationLabel, ...studentContent } = content.value.students;

		return {
			...studentContent,
			support: [`${locationLabel} — ${content.value.hero.location}`, ...studentContent.support]
		};
	});

	return {
		content,
		site: computed(() => content.value.site),
		settings: computed(() => content.value.settings),
		contact,
		hero: computed(() => content.value.hero),
		lessons: computed(() => content.value.lessons),
		students,
		trial: computed(() => content.value.trial),
		contactForm: computed(() => content.value.contactForm),
		announcement: computed(() => content.value.announcement),
		footer: computed(() => content.value.footer),
		colorModeDefault
	};
});
