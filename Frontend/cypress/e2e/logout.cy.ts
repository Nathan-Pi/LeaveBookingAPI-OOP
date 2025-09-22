describe('Logout Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testPassword'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard'); // Confirm login
  });

  it('should log out and redirect to login, and protect pages after logout', () => {
    cy.get('button[aria-label="Logout"]').click();

    cy.url().should('include', '/login');

    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});