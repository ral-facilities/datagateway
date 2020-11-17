describe('DLS - Proposals Cards', () => {
  beforeEach(() => {
    Cypress.currentTest.retries(1);
    cy.server();
    cy.route('**/investigations/count*').as('getInvestigationsCount');
    cy.route('**/investigations?order*').as('getInvestigationsOrder');
    cy.login('user', 'password');
    cy.visit('/browse/proposal/').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="secondary checkbox"]')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#card')
      .contains('Including spend increase ability music skill former.')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation'
    );
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Title')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('A nothing almost arrive I.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('Whom anything affect consider left.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains(
      'Including spend increase ability music skill former.'
    );
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Name')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('INVESTIGATION 1');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('INVESTIGATION 1');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Title"]')
      .find('input')
      .type('Dog')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('Dog want single resource major.');

    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]')
      .find('input')
      .type('2')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('INVESTIGATION 2');
  });
});
