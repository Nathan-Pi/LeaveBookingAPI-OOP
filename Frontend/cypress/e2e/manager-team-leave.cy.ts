describe('Manager team leave management', () => {
  it("Manager can view/manage their team's leave requests", () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testManagerEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testManagerPassword'));
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.visit('/team/requests');

    cy.contains('h1, h2, h3', /team leave requests/i);

    cy.get('table').should('exist').within(() => {
      cy.contains('th', 'Staff Member');
      cy.contains('th', 'Dates');
      cy.contains('th', 'Reason');
      cy.contains('th', 'Status');
      cy.contains('th', 'Actions');
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

  });
});