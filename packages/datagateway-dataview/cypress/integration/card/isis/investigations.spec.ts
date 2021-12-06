describe('ISIS - Investigations Cards', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/instrument/1/facilityCycle/16/investigation').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="page-view Display as cards"]').click();
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
      .contains('Again bad simply low summer.')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97'
    );
  });

  it('should have the correct url for the DOI link', () => {
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
  });

  it('should be able to expand "More Information"', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('More Information')
      .click({ force: true });

    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('INVESTIGATION 97');

    // Study PID

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
      .contains('Noah Jones');
    cy.get('#investigation-samples-tab').click({ force: true });

    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('SAMPLE 97');

    cy.get('#investigation-publications-tab').click({ force: true });

    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('Safe tough case newspaper.');

    cy.get('#investigation-datasets-tab').click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset'
    );
  });

  describe('should be able to sort by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getInvestigationsOrder', { timeout: 10000 });
    });

    it('one field', () => {
      cy.contains('[role="button"]', 'Title')
        .click()
        .wait('@getInvestigationsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]')
        .first()
        .contains('Again bad simply low summer.');

      cy.contains('[role="button"]', 'Title')
        .click()
        .wait('@getInvestigationsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'asc').should('not.exist');
      cy.contains('[role="button"]', 'desc').should('exist');
      cy.get('[data-testid="card"]')
        .first()
        .contains('He represent address cut environmental special size.');

      cy.contains('[role="button"]', 'Title')
        .click()
        .wait('@getInvestigationsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'asc').should('not.exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]')
        .first()
        .contains('He represent address cut environmental special size.');
    });

    it('multiple fields', () => {
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getInvestigationsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]')
        .first()
        .contains('He represent address cut environmental special size.');

      cy.contains('[role="button"]', 'Title')
        .click()
        .wait('@getInvestigationsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]')
        .first()
        .contains('He represent address cut environmental special size.');
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getInvestigationsOrder', { timeout: 10000 });
    });

    it('multiple fields', () => {
      cy.get('[aria-label="advanced-filters-link"]').click();
      cy.get('[aria-label="Filter by Title"]')
        .first()
        .type('again')
        .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
          timeout: 10000,
        });

      cy.get('[data-testid="card"]')
        .first()
        .contains('Again bad simply low summer.');
      // check that size is correct after filtering
      cy.get('[data-testid="card"]').first().contains('10.93 GB');

      cy.get('input[id="Start Date filter from"]')
        .type('2004-01-01')
        .wait(['@getInvestigationsCount'], { timeout: 10000 });
      cy.get('[data-testid="card"]')
        .first()
        .contains('Again bad simply low summer.');
      cy.get('input[id="Start Date filter to"]')
        .type('2004-01-02')
        .wait(['@getInvestigationsCount'], { timeout: 10000 });
      cy.get('[data-testid="card"]').should('not.exist');
    });
  });
});
