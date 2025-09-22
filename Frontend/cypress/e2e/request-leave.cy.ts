describe('User can submit a valid leave request', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testPassword'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('submits leave request, sees success, and finds it in My Requests', () => {
  
    cy.visit('/leave/request');
    cy.url().should('include', '/leave/request');

    // Fill in lrq form
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().slice(0, 10);

    const nextDate = new Date();
    nextDate.setDate(tomorrowDate.getDate() + 1);
    const next = nextDate.toISOString().slice(0, 10);

    cy.get('#startDate').clear().type(tomorrow);
    cy.get('#endDate').clear().type(next);
    cy.get('#reason').type('Automated Cypress test leave');

    cy.contains('button', 'Submit Leave Request').click();

    cy.contains('Leave request submitted!').should('be.visible');

    cy.visit('/leave/my-requests');

    // make sure the new request is here
    cy.contains(tomorrow).should('exist');
    cy.contains('Automated Cypress test leave').should('exist');
    cy.contains(/pending|awaiting approval/i).should('exist'); // if status shown
  });
});