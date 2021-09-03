describe('DLS - Proposals Cards', () => {
  // TODO: Check requests
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/proposal/').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="page-view Display as cards"]')
      .click()
      .wait(['@getInvestigationsOrder'], {
        timeout: 10000,
      });
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

  // TODO: Check requests
  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('About quickly both stop.');

    cy.contains('[role="button"]', 'Title').click();
    // .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('Yourself smile either I pass significant.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains(
      'Including spend increase ability music skill former.'
    );
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Name')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('INVESTIGATION 1');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('INVESTIGATION 1');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Title"]')
      .first()
      .type('Dog')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('Energy place money bad authority.');

    cy.get('[aria-label="Filter by Name"]')
      .first()
      .type('2')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('INVESTIGATION 192');
  });
});
