describe('ISIS - Investigations Cards', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit(
      '/browse/instrument/13/facilityCycle/12/investigation?view=card'
    ).wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
      timeout: 10000,
    });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    cy.get('[data-testid="card"]')
      .first()
      .get('[data-testid="isis-investigations-card-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="card"]')
          .first()
          .get('[data-testid="isis-investigations-card-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });

    //Default sort
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('Stop system investment')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/13/facilityCycle/12/investigation/31'
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
      .contains('INVESTIGATION 31');

    // DataPublication PID

    cy.get('[data-testid="card"]')
      .first()
      .get('[data-testid="investigation-details-panel-pid-link"]')
      .first()
      .then(($pid) => {
        const pid = $pid.text();

        const url = `https://doi.org/${pid}`;

        cy.get('[data-testid="card"]')
          .first()
          .get('[data-testid="investigation-details-panel-pid-link"]')
          .first()
          .should('have.attr', 'href', url);
      });

    // DOI

    cy.get('[data-testid="card"]')
      .first()
      .get('[data-testid="investigation-details-panel-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="card"]')
          .first()
          .get('[data-testid="investigation-details-panel-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });

    cy.get('#investigation-users-tab').click({ force: true });

    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('Dustin Hall');
    cy.get('#investigation-samples-tab').click({ force: true });

    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('SAMPLE 31');

    cy.get('#investigation-publications-tab').click({ force: true });

    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('Pressure meeting would year but energy');

    cy.get('#investigation-datasets-tab').click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/instrument/13/facilityCycle/12/investigation/31/dataset'
    );
  });

  it('should be able to sort by one field or multiple', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Start Date').as('dateSortButton').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });

    // ascending
    cy.contains('[role="button"]', 'Title').as('titleSortButton').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Stop system investment');

    // descending
    cy.get('@titleSortButton').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').first().contains('Stop system investment');

    // no order
    cy.get('@titleSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Stop system investment');

    // multiple fields
    cy.get('@dateSortButton').click();
    cy.get('@titleSortButton').click({ shiftKey: true });
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });

    cy.contains('[aria-label="Sort by TITLE"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by START DATE"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Stop system investment');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[data-testid="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Title"]').first().type('stop');
    cy.wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
      timeout: 10000,
    });

    cy.get('[data-testid="card"]').first().contains('Stop system investment');
    // check that size is correct after filtering
    cy.get('[data-testid="card"]').first().contains('3.31 GB');

    cy.get('input[id="Start Date filter from"]').type('2007-08-01');
    cy.wait(['@getInvestigationsCount'], { timeout: 10000 });
    cy.get('[data-testid="card"]').first().contains('Stop system investment');
    cy.get('input[id="Start Date filter to"]').type('2007-08-02');
    cy.wait(['@getInvestigationsCount'], { timeout: 10000 });
    cy.get('[data-testid="card"]').should('not.exist');
  });
});
