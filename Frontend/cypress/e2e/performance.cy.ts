describe('Performance tests', () => {
  const pages = [
    { url: '/', description: 'home/dashboard' },
    { url: '/login', description: 'login' },
    { url: '/admin/staff', description: 'admin staff (admin only)' },
    { url: '/team/requests', description: 'team requests (manager only)' }
  ];

  pages.forEach(page => {
    it(`should load the ${page.description} page in under 2 seconds`, () => {
      const start = Date.now();
      cy.visit(page.url, { timeout: 10000 });
      cy.window().should('exist');
      const duration = Date.now() - start;
      expect(duration).to.be.lessThan(2000);
    });
  });

  it('login API returns in under 2 seconds', () => {
    const email = Cypress.env('testAdminEmail');
    const password = Cypress.env('testAdminPassword');
    const start = Date.now();
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/login',
      body: { email, password },
      failOnStatusCode: false
    }).then((resp) => {
      const duration = Date.now() - start;
      expect(duration).to.be.lessThan(2000);
      expect(resp.status).to.eq(202);
    });
  });

  it('users API returns in under 2 seconds after login', () => {
    cy.request('POST', 'http://localhost:3001/api/login', {
      email: Cypress.env('testAdminEmail'),
      password: Cypress.env('testAdminPassword')
    }).then((loginResp) => {
      const token = loginResp.body.token;
      const start = Date.now();
      cy.request({
        method: 'GET',
        url: 'http://localhost:3001/api/users',
        headers: { Authorization: `Bearer ${token}` }
      }).then((resp) => {
        const duration = Date.now() - start;
        expect(duration).to.be.lessThan(2000);
        expect(resp.status).to.eq(200);
      });
    });
  });
});