describe('Admin staff management functionality', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testAdminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testAdminPassword'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.visit('/admin/staff');
    cy.url().should('include', '/admin/staff');
    cy.contains('Staff Management');
  });

  it('should land on the staff page as admin', () => {
    cy.url().should('include', '/admin/staff');
    cy.contains('Staff Management');
  });

  it('displays a staff list with entries', () => {
    cy.get('table').should('exist');
    cy.contains('th', 'Name');
    cy.contains('th', 'Email');
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('creates a new staff user with valid data', () => {
    const uniqueEmail = `cypressuser${Math.floor(Math.random()*100000)}@test.com`;
    Cypress.env('createdEmail', uniqueEmail);
    cy.get('input[name="email"]').clear().type(uniqueEmail);
    cy.get('input[name="password"]').clear().type('Cypress123!');
    cy.get('input[name="firstname"]').clear().type('Cypress');
    cy.get('input[name="surname"]').clear().type('Test');
    cy.get('select[name="roleId"]').should('exist').then($select => {
      cy.get('select[name="roleId"]').select($select.find('option').eq(1).val());
    });
    cy.contains('button', 'Create User').click();
    cy.wait(1000);
    cy.contains('User created successfully!');
    cy.contains(uniqueEmail);
  });

  it('changes the admin user role to manager and back', () => {
    cy.contains('td', 'testadmin@test.com').parent('tr').within(() => {
      cy.get('select').then($select => {
        let managerValue;
        $select.find('option').each((i, el) => {
          if (el.innerText.toLowerCase().indexOf('manager') !== -1) managerValue = el.value;
        });
        if (managerValue) {
          cy.get('select').select(managerValue);
          cy.wait(1000);
          cy.get('td').eq(3).should('contain', 'Manager');
        }
      });
      cy.get('select').then($select => {
        let adminValue;
        $select.find('option').each((i, el) => {
          if (el.innerText.toLowerCase().indexOf('admin') !== -1) adminValue = el.value;
        });
        if (adminValue) {
          cy.get('select').select(adminValue);
          cy.wait(1000);
          cy.get('td').eq(3).should('contain', 'Admin');
        }
      });
    });
  });

  it('updates a staff user\'s annual leave balance', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('td').eq(5).find('span').invoke('text').then((currentVal) => {
        let original = parseInt(currentVal);
        cy.get('button').contains('+').click();
        cy.wait(1000);
        cy.get('td').eq(5).find('span').should('contain', original + 1);
        cy.get('button').contains('-').click();
        cy.wait(1000);
        cy.get('td').eq(5).find('span').should('contain', original);
      });
    });
  });

  it('deletes the staff user created in this session', () => {
    const uniqueEmail = Cypress.env('createdEmail');
    cy.contains('td', uniqueEmail).parent('tr').within(() => {
      cy.contains('button', 'Delete').click();
    });
    cy.contains('Are you sure').should('be.visible');
    cy.wait(300);
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('button', 'Delete')
        .scrollIntoView()
        .should('be.visible')
        .click();
    });
    cy.wait(1000);
    cy.contains('td', uniqueEmail).should('not.exist');
  });
});