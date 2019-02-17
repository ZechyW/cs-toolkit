describe("The main app navbar", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("toggles on click", () => {
    cy.get(".navbar")
      .should("have.class", "is-expanded")
      .click()
      .should("not.have.class", "is-expanded")
      .click()
      .should("have.class", "is-expanded");
  });

  it("collapses when window is scrolled", () => {
    cy.scrollTo(0, 1);
    cy.get(".navbar").should("not.have.class", "is-expanded");
  });

  it("Snapshot - Expanded", () => {
    cy.get(".navbar")
      .should("have.class", "is-expanded")
      .and("not.have.class", "is-animating");
    cy.get(".navbar").toMatchSnapshot();
  });

  it("Snapshot - Collapsed", () => {
    // Should collapse on click
    cy.get(".navbar")
      .click()
      .should("not.have.class", "is-expanded")
      .and("not.have.class", "is-animating");
    cy.get(".navbar").toMatchSnapshot();
  });
});
