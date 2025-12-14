describe("Homepage", () => {
	it("shows the hero headline and primary contact actions", () => {
		cy.visit("/");

		cy.contains("h1", "Violin lessons with Carla", { matchCase: false }).should("be.visible");
		cy.contains("a", "Schedule a lesson")
			.should("have.attr", "href")
			.and("contain", "mailto:lessons@mariettaviolin.com");
		cy.contains("a", "Call or text (770) 555-1717").should("have.attr", "href").and("eq", "tel:+17705551717");
	});

	it("lists lesson options, studio details, and student support notes", () => {
		cy.visit("/");

		cy.get("section#lessons")
			.should("be.visible")
			.within(() => {
				const lessons = ["30-minute weekly", "45-minute weekly", "60-minute coaching"];
				lessons.forEach((title) => {
					cy.contains(title).should("be.visible");
				});
			});

		cy.get("section#studio")
			.should("be.visible")
			.within(() => {
				["Where", "How we meet", "Who I teach"].forEach((label) => {
					cy.contains(label).should("be.visible");
				});
			});

		cy.get("section#students").within(() => {
			cy.contains("What to expect each week").should("be.visible");
			cy.get("li").its("length").should("be.greaterThan", 3);
		});
	});

	it("provides clear contact options in the contact section and footer", () => {
		cy.visit("/");

		cy.get("section#contact")
			.should("be.visible")
			.within(() => {
				cy.contains("Email Carla")
					.should("have.attr", "href")
					.and("contain", "mailto:lessons@mariettaviolin.com");
				cy.contains("Call or text (770) 555-1717").should("have.attr", "href").and("eq", "tel:+17705551717");
			});

		cy.get("footer").within(() => {
			cy.contains("lessons@mariettaviolin.com")
				.should("have.attr", "href")
				.and("contain", "mailto:lessons@mariettaviolin.com");
			cy.contains("(770) 555-1717").should("have.attr", "href", "tel:+17705551717");
		});
	});
});
