describe('ISIS - Instruments Cards', () => {
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

    //Default sort
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#card')
      .contains('Air it quickly everybody have image left.')
      .click({ force: true });
    cy.location('pathname').should('eq', '/browse/instrument/11/facilityCycle');
  });

  it('should be able to expand "More Information"', () => {
    cy.get('#card').contains('More Information').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Air it quickly everybody have image left.');
    cy.get('#instrument-users-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Brianna Martin');
  });

  describe('should be able to sort by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Name')
        .click()
        .click()
        .wait('@getInstrumentsOrder', { timeout: 10000 });
    });

    it('one field', () => {
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

    it('multiple fields', () => {
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
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Name')
        .click()
        .click()
        .wait('@getInstrumentsOrder', { timeout: 10000 });
    });
    it('multiple fields', () => {
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
  });
});
