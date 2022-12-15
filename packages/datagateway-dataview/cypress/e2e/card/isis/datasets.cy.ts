describe('ISIS - Datasets Cards', () => {
  beforeEach(() => {
    cy.intercept('**/datasets/count*').as('getDatasetsCount');
    cy.intercept('**/datasets?order*').as('getDatasetsOrder');
    cy.login();
    cy.visit(
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset'
    ).wait(['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'], {
      timeout: 10000,
    });
    cy.get('[aria-label="page view Display as cards"]')
      .click()
      .wait(['@getDatasetsOrder'], {
        timeout: 10000,
      });
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
      .contains('DATASET 97')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/97'
    );
  });

  it('should be able to expand "More Information"', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Create Time')
      .click()
      .wait('@getDatasetsOrder', { timeout: 10000 });

    cy.get('[data-testid="card"]')
      .first()
      .contains('More Information')
      .click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('DATASET 97');
    cy.get('#dataset-type-tab').click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('DATASETTYPE 1');
    cy.get('#dataset-datafiles-tab').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/97/datafile'
    );
  });

  describe('should be able to sort by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@getDatasetsOrder', { timeout: 10000 });
    });

    it('one field', () => {
      cy.contains('[role="button"]', 'Name').click().wait('@getDatasetsOrder', {
        timeout: 10000,
      });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('DATASET 337');

      cy.contains('[role="button"]', 'Name').click().wait('@getDatasetsOrder', {
        timeout: 10000,
      });
      cy.contains('[role="button"]', 'asc').should('not.exist');
      cy.contains('[role="button"]', 'desc').should('exist');
      cy.get('[data-testid="card"]').first().contains('DATASET 97');

      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'asc').should('not.exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('DATASET 97');
    });

    it('multiple fields', () => {
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@getDatasetsOrder', {
          timeout: 10000,
        });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('DATASET 337');

      cy.contains('[role="button"]', 'Name').click().wait('@getDatasetsOrder', {
        timeout: 10000,
      });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('DATASET 337');
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@getDatasetsOrder', { timeout: 10000 });
    });

    it('multiple fields', () => {
      cy.get('[data-testid="advanced-filters-link"]').click();
      cy.get('[aria-label="Filter by Name"]')
        .first()
        .type('337')
        .wait(['@getDatasetsCount', '@getDatasetsOrder'], { timeout: 10000 });
      cy.get('[data-testid="card"]').first().contains('DATASET 337');
      // check that size is correct after filtering
      cy.get('[data-testid="card"]').first().contains('5.53 GB');

      cy.get('input[id="Create Time filter from"]')
        .type('2019-01-01')
        .wait(['@getDatasetsCount'], { timeout: 10000 });
      cy.get('input[aria-label="Create Time filter to"]')
        .parent()
        .find('button')
        .click();
      cy.get('.MuiPickersDay-root[tabindex="-1"]')
        .first()
        .click()
        .wait(['@getDatasetsCount'], { timeout: 10000 });
      const date = new Date();
      date.setDate(1);
      cy.get('input[id="Create Time filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );
      cy.get('[data-testid="card"]').should('not.exist');
    });
  });
});
