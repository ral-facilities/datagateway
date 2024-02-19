describe('DLS - Visits Cards', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/proposal/INVESTIGATION%201/investigation?view=card').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
      { timeout: 10000 }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('70')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset'
    );
  });

  it('should be able to expand "More Information"', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('More Information')
      .click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('INVESTIGATION 1');
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('3.12 GB', { timeout: 10000 });
    cy.get('#visit-users-tab').click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('Colleen Heath');
    cy.get('#visit-samples-tab').click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('SAMPLE 1');
    cy.get('#visit-publications-tab').click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('Simple notice since view check over through there.');
  });

  // only 1 visit, so no point in testing sorting
  it.skip('should be able to sort by one field or multiple', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Start Date').as('dateSortButton').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });

    // ascending
    cy.contains('[role="button"]', 'Visit ID').as('visitIdSortButton').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('70');

    // descending
    cy.get('@visitIdSortButton').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').first().contains('70');

    // no order
    cy.get('@visitIdSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('70');

    // multiple fields
    cy.get('@dateSortButton').click();
    cy.get('@visitIdSortButton').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });

    cy.contains('[aria-label="Sort by VISIT ID"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by START DATE"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('70');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[data-testid="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Visit ID"]').first().type('7');
    cy.wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]').first().contains('70');

    cy.get('input[id="Start Date filter from"]').type('2000-05-01');
    cy.wait(['@getInvestigationsCount'], { timeout: 10000 });
    cy.get('input[aria-label="Start Date filter to"]')
      .parent()
      .find('button')
      .click();
    cy.get('.MuiPickersDay-root[type="button"]').first().click();
    cy.wait(['@getInvestigationsCount'], { timeout: 10000 });
    const date = new Date();
    date.setDate(1);
    cy.get('input[id="Start Date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('[data-testid="card"]').should('not.exist');
  });
});
