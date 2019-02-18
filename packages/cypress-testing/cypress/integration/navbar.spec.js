describe("The main app navbar", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("shows the burger menu when the width is less than 1088px", () => {
    cy.viewport(1088, 500);
    cy.get(".navbar-burger").should("not.be.visible");
    cy.viewport(1087, 500);
    cy.get(".navbar-burger").should("be.visible");
  });

  describe("toggles", () => {
    it("on click", () => {
      cy.get(".navbar")
        .should("have.class", "is-expanded")
        .click()
        .should("not.have.class", "is-expanded")
        .click()
        .should("have.class", "is-expanded");
    });

    it("only if the burger menu is collapsed", () => {
      cy.viewport(1087, 500);
      cy.get(".navbar-burger")
        .click()
        .should("have.class", "is-active");

      cy.get(".navbar")
        .should("not.have.class", "is-expanded")
        .click()
        .should("not.have.class", "is-expanded");
    });
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
