describe('Session persistency', () => {
  it('Session is persisted on refresh (user remains logged in)', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testAdminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testAdminPassword'));
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard');

    cy.reload();

    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard');
    cy.contains(/logout/i).should('exist');
  });
});