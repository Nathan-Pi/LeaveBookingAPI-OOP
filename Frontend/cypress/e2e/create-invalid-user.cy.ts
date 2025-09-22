describe('Admin user creation validation', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[placeholder="Enter email"]').type(Cypress.env('testAdminEmail'));
    cy.get('input[placeholder="Password"]').type(Cypress.env('testAdminPassword'));
    cy.get('button[type="submit"]').contains('Login').click();
    cy.url().should('include', '/dashboard');
    cy.visit('/admin/staff');
  });

  it('shows error for duplicate email', () => {
    cy.get('input[name="email"]').clear().type(Cypress.env('testEmail'));
    cy.get('input[name="password"]').clear().type('SomePassword1!');
    cy.get('input[name="firstname"]').clear().type('Duplicate');
    cy.get('input[name="surname"]').clear().type('User');
    cy.get('select[name="roleId"]').select(1);
    cy.get('button[type="submit"]').contains(/create user/i).click();
    cy.contains(/duplicate/i).should('be.visible');
  });

  it('shows error for invalid user fields', () => {
    cy.get('input[name="email"]').clear().type('notanemail');
    cy.get('input[name="password"]').clear().type('123');
    cy.get('input[name="firstname"]').clear().type('x');
    cy.get('input[name="surname"]').clear().type('x');
    cy.get('select[name="roleId"]').select(1);
    cy.get('button[type="submit"]').contains(/create user/i).click();
    cy.contains(/invalid|required|too short|must enter/i).should('be.visible');
  });
});