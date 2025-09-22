describe('Dashboard displays correct info for authenticated user', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testPassword'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    cy.wait(700);
  });

  it('shows annual leave balance, recent activity, and pending requests', () => {

    cy.contains('Remaining Leave:').should('exist');
    cy.contains('Pending Requests:').should('exist');
    cy.contains('Recent Activity').should('exist');
    cy.contains('Upcoming Holidays').should('exist');

  });
});