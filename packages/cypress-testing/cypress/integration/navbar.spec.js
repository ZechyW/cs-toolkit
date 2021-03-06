import { actions as coreActions } from "../../../react-frontend/src/core";

describe("The main app navbar", () => {
  // Viewports
  function viewportBurger() {
    cy.viewport(1023, 500);
  }

  function viewportNoBurger() {
    cy.viewport(1024, 500);
  }

  function viewportScroll() {
    cy.viewport(1024, 161);
  }

  beforeEach(() => {
    cy.visit("/");

    // Clear out any persisted Redux state.
    cy.window()
      .its("store")
      .invoke("dispatch", coreActions.resetAll());

    viewportScroll();
  });

  describe("burger menu", () => {
    beforeEach(() => {
      viewportBurger();
    });

    it("is available only when the viewport is small", () => {
      cy.get(".navbar-burger").should("be.visible");

      viewportNoBurger();
      cy.get(".navbar-burger").should("not.be.visible");
    });

    it("is shown when the burger is clicked", () => {
      cy.get(".navbar-burger").click();
      cy.get(".navbar-menu").should("be.visible");
    });

    it("collapses when the user clicks outside it", () => {
      cy.get(".navbar-burger").click();
      cy.get(".navbar-menu").should("be.visible");

      cy.get("body").click(1, 499);
      cy.get(".navbar-menu").should("not.be.visible");
    });
  });

  describe("toggles", () => {
    it("on click", () => {
      // Starts expanded
      cy.get(".navbar").should("have.class", "is-expanded");
      cy.get(".navbar .title").click();

      // Wait until it's done collapsing
      cy.get(".navbar")
        .should("not.have.class", "is-expanded")
        .and("not.have.class", "is-animating");
      cy.get(".navbar .title").click();

      // Expand again
      cy.get(".navbar").should("have.class", "is-expanded");
    });

    it("only if the burger menu is collapsed", () => {
      viewportBurger();
      cy.get(".navbar-burger")
        .click()
        .should("have.class", "is-active");

      cy.get(".navbar")
        .should("not.have.class", "is-expanded")
        .click()
        .should("not.have.class", "is-expanded");
    });
  });

  it("collapses when the document is scrolled", () => {
    viewportScroll();
    cy.scrollTo("bottom");
    cy.get(".navbar").should("not.have.class", "is-expanded");
  });

  it("Snapshot - Expanded", () => {
    cy.get(".navbar")
      .should("have.class", "is-expanded")
      .and("not.have.class", "is-animating")
      .and("not.have.class", "is-offline");
    cy.get(".navbar").toMatchSnapshot();
  });

  it("Snapshot - Collapsed", () => {
    // Should collapse on click
    cy.get(".navbar").should("have.class", "is-expanded");
    cy.get(".navbar .title").click();

    cy.get(".navbar")
      .should("not.have.class", "is-animating")
      .and("not.have.class", "is-expanded")
      .and("not.have.class", "is-offline");
    cy.get(".navbar").toMatchSnapshot();
  });
});
