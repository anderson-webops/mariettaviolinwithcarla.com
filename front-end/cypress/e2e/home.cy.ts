import site from "../../src/content/site.json";

const { hero, contact, lessons, studio, students, trial, footer, contactForm } = site;

describe("Homepage", () => {
	it("shows the hero headline and primary contact actions", () => {
		cy.visit("/");

		cy.contains("h1", hero.headline, { matchCase: false }).should("be.visible");
		cy.contains("a", hero.primaryCta.label).should("have.attr", "href").and("contain", contact.email);
		cy.contains("a", contact.phoneDisplay).should("have.attr", "href").and("eq", contact.phoneHref);
	});

	it("lists lesson options, studio details, and student support notes", () => {
		cy.visit("/");

		cy.get("section#lessons")
			.should("be.visible")
			.within(() => {
				lessons.cards.forEach((card) => {
					cy.contains(card.name).should("be.visible");
				});
			});

		cy.get("section#studio")
			.should("be.visible")
			.within(() => {
				studio.notes.forEach((note) => {
					cy.contains(note.label).should("be.visible");
				});
			});

		cy.get("section#students").within(() => {
			cy.contains(students.title).should("be.visible");
			cy.get("li").its("length").should("be.greaterThan", 3);
		});
	});

	it("provides clear contact options in the contact section and footer", () => {
		cy.visit("/");

		cy.get("section#contact")
			.should("be.visible")
			.within(() => {
				cy.contains(trial.primaryLabel).should("have.attr", "href").and("contain", contact.email);
				cy.get("form")
					.should("have.attr", "action", contactForm.action)
					.within(() => {
						contactForm.fields.forEach((field) => {
							const selector =
								field.type === "textarea"
									? `textarea[name="${field.name}"]`
									: `input[name="${field.name}"]`;
							cy.get(selector).should("exist");
						});
						cy.contains("button", contactForm.submitLabel).should("be.visible");
					});
				cy.contains(trial.secondaryLabel).should("have.attr", "href").and("eq", contact.phoneHref);
			});

		cy.get("footer").within(() => {
			cy.contains(contact.email).should("have.attr", "href").and("contain", contact.email);
			cy.contains(contact.phoneDisplay).should("have.attr", "href", contact.phoneHref);
			cy.contains(footer.eyebrow).should("be.visible");
		});
	});
});
