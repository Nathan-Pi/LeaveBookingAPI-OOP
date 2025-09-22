describe("Login Page", () => {
  it("should display login form and allow user to log in", () => {
    cy.visit("http://localhost:3000/login");

    cy.get('input[name="email"]').type(Cypress.env('testEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testPassword'));
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/dashboard");
    cy.contains("Welcome").should("be.visible");
  });
});