describe('ISIS - Instruments Cards', () => {
  // TODO: Check requests
  beforeEach(() => {
    cy.intercept('**/instruments/count*').as('getInstrumentsCount');
    cy.intercept('**/instruments?order*').as('getInstrumentsOrder');
    cy.login();
    cy.visit('/browse/instrument').wait(
      ['@getInstrumentsCount', '@getInstrumentsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="page-view Display as cards"]').click();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#card')
      .contains('Season identify professor happen third.')
      .click({ force: true });
    cy.location('pathname').should('eq', '/browse/instrument/1/facilityCycle');
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Name')
      .click()
      .wait('@getInstrumentsOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Air it quickly everybody have image left.');

    cy.contains('[role="button"]', 'Name')
      .click()
      .wait('@getInstrumentsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('With piece reason late model.');

    cy.contains('[role="button"]', 'Name')
      .click()
      .wait('@getInstrumentsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Season identify professor happen third.');
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Description')
      .click()
      .wait('@getInstrumentsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Near must surface law how full.');

    cy.contains('[role="button"]', 'Type')
      .click()
      .wait('@getInstrumentsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('4');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]')
      .first()
      .type('Near')
      .wait(['@getInstrumentsCount', '@getInstrumentsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('Near must surface law how full.');

    cy.get('[aria-label="Filter by Type"]')
      .first()
      .type('4')
      .wait(['@getInstrumentsCount', '@getInstrumentsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('4');
  });

  it('should be able to expand "More Information"', () => {
    cy.get('#card').contains('More Information').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Season identify professor happen third.');
    cy.get('#instrument-users-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Marcus Dixon');
  });
});
