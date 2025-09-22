describe('Security tests', () => {
  it('should redirect unauthenticated users to login from protected pages', () => {
    cy.clearCookies();
    cy.visit('/admin/staff');
    cy.url().should('include', '/login');
    cy.get('form').should('exist');

    cy.visit('/team/requests');
    cy.url().should('include', '/login');
    cy.get('form').should('exist');
  });

  it('prevents a regular user from accessing admin pages', () => {
    cy.visit('/login');
    cy.get('input[placeholder="Enter email"]').type('testuser@test.com');
    cy.get('input[placeholder="Password"]').type('testuser123');
    cy.get('button[type="submit"]').contains('Login').click();
    cy.url().should('not.include', '/login');

    cy.visit('/admin/staff');
    cy.url().should('include', '/dashboard');
  });

  it('allows only the right roles to access admin or manager features', () => {
    cy.visit('/login');
    cy.get('input[placeholder="Enter email"]').type(Cypress.env('testManagerEmail'));
    cy.get('input[placeholder="Password"]').type(Cypress.env('testManagerPassword'));
    cy.get('button[type="submit"]').contains('Login').click();
    cy.url().should('not.include', '/login');

    cy.visit('/admin/staff');
    cy.url().should('include', '/dashboard');

    cy.visit('/team/requests');
    cy.url().should('include', '/team/requests');
    cy.contains(/team leave requests/i);
  });

  it('logs out and invalidates the session', () => {
    cy.visit('/login');
    cy.get('input[placeholder="Enter email"]').type(Cypress.env('testAdminEmail'));
    cy.get('input[placeholder="Password"]').type(Cypress.env('testAdminPassword'));
    cy.get('button[type="submit"]').contains('Login').click();
    cy.url().should('not.include', '/login');

    cy.contains(/logout/i).click();

    cy.visit('/admin/staff');
    cy.url().should('include', '/login');
    cy.get('form').should('exist');
  });
});