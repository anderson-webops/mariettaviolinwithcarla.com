import site from "../../src/content/site.json";

const { hero, contact, lessons, students, trial, footer, contactForm } = site;
const smsHref = contact.phoneHref.replace(/^tel:/, "sms:");

describe("Homepage", () => {
	it("shows the hero headline and primary contact actions", () => {
		cy.visit("/");

		cy.contains("h1", hero.headline, { matchCase: false }).should("be.visible");
		cy.contains("a", hero.primaryCta.label).should("have.attr", "href").and("contain", contact.email);
		cy.contains("a", `${contact.callLabel} ${contact.phoneDisplay}`)
			.should("have.attr", "href")
			.and("eq", contact.phoneHref);
		cy.contains("a", `${contact.textLabel} ${contact.phoneDisplay}`).should("have.attr", "href").and("eq", smsHref);
	});

	it("lists lesson options and student support notes", () => {
		cy.visit("/");

		cy.get("section#lessons")
			.should("be.visible")
			.within(() => {
				lessons.cards.forEach((card) => {
					cy.contains(card.name).should("be.visible");
				});
			});

		cy.get("section#students").within(() => {
			cy.contains(students.title).should("be.visible");
			cy.contains(students.body).should("be.visible");
			cy.get("li").its("length").should("be.greaterThan", 3);
		});
	});

	it("provides clear contact options in the contact section and footer", () => {
		cy.visit("/");

		cy.get("section#contact")
			.should("be.visible")
			.within(() => {
				cy.contains(trial.title).should("be.visible");
				cy.contains(trial.body).should("be.visible");
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
			});

		cy.get("footer").within(() => {
			cy.contains(contact.email).should("have.attr", "href").and("contain", contact.email);
			cy.contains(contact.phoneDisplay).should("have.attr", "href", contact.phoneHref);
			cy.contains(footer.eyebrow).should("be.visible");
		});
	});
});
