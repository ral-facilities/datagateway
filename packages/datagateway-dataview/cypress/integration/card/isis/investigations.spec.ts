describe('ISIS - Investigations Cards', () => {
  // TODO: Check requests
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/instrument/1/facilityCycle/16/investigation').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="page-view"]').click();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#card')
      .contains('He represent address cut environmental special size.')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/16'
    );
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Again bad simply low summer.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains(
      'He represent address cut environmental special size.'
    );

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains(
      'He represent address cut environmental special size.'
    );
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains(
      'He represent address cut environmental special size.'
    );

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains(
      'He represent address cut environmental special size.'
    );
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Title"]')
      .first()
      .type('cut')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains(
      'He represent address cut environmental special size.'
    );

    cy.get('[aria-label="Start Date date filter from"]')
      .type('2004-01-01')
      .wait(['@getInvestigationsCount'], { timeout: 10000 });
    cy.get('#card').contains(
      'He represent address cut environmental special size.'
    );
    cy.get('[aria-label="Start Date date filter to"]')
      .type('2004-01-02')
      .wait(['@getInvestigationsCount'], { timeout: 10000 });
    cy.get('#card').should('not.exist');
  });

  it('should be able to expand "More Information"', () => {
    cy.get('#card').contains('More Information').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('INVESTIGATION 16');
    cy.get('#investigation-users-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Corey Cook');
    cy.get('#investigation-samples-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('SAMPLE 16');
    cy.get('#investigation-publications-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Fish page on factor nature everybody action.');
    cy.get('#investigation-datasets-tab').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/16/dataset'
    );
  });
});
