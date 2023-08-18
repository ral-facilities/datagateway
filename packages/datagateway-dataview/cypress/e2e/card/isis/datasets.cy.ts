describe('ISIS - Datasets Cards', () => {
  beforeEach(() => {
    cy.intercept('**/datasets/count*').as('getDatasetsCount');
    cy.intercept('**/datasets?order*').as('getDatasetsOrder');
    cy.login();
    cy.visit(
      '/browse/instrument/1/facilityCycle/19/investigation/19/dataset?view=card'
    ).wait(['@getDatasetsCount', '@getDatasetsOrder'], {
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

  it('should be able to click a dataset to see its datafiles', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('DATASET 79')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/19/investigation/19/dataset/79'
    );
  });

  it('should be able to expand "More Information"', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Create Time').click();
    cy.wait('@getDatasetsOrder', { timeout: 10000 });

    cy.get('[data-testid="card"]')
      .first()
      .contains('More Information')
      .click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('DATASET 19');
    cy.get('#dataset-type-tab').click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('DATASETTYPE 1');
    cy.get('#dataset-datafiles-tab').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/19/investigation/19/dataset/19/datafile'
    );
  });

  it('should be able to sort by one field or multiple', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Create Time').as('timeSortButton').click();
    cy.wait('@getDatasetsOrder', { timeout: 10000 });

    // ascending
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();
    cy.wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 19');

    // descending
    cy.get('@nameSortButton').click();
    cy.wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 79');

    // no order
    cy.get('@nameSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 19');

    // multiple fields
    cy.get('@timeSortButton').click();
    cy.wait('@getDatasetsOrder', {
      timeout: 10000,
    });

    cy.get('@nameSortButton').click();
    cy.wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[aria-label="Sort by NAME"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by CREATE TIME"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');

    cy.get('[data-testid="card"]').first().contains('DATASET 19');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[data-testid="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]').first().type('19');
    cy.wait(['@getDatasetsCount', '@getDatasetsOrder'], { timeout: 10000 });

    cy.get('[data-testid="card"]').first().contains('DATASET 19');
    // check that size is correct after filtering
    cy.get('[data-testid="card"]').first().contains('1.47 GB');

    cy.get('input[id="Create Time filter from"]').type('2019-01-01');
    cy.wait(['@getDatasetsCount'], { timeout: 10000 });
    cy.get('[data-testid="card"]').first().contains('DATASET 19');

    cy.get('input[aria-label="Create Time filter to"]')
      .parent()
      .find('button')
      .click();
    cy.get('.MuiPickersCalendarHeader-label').click();
    cy.contains('2020').click();
    cy.get('.MuiPickersDay-root[type="button"]').first().click();
    cy.wait(['@getDatasetsCount'], { timeout: 10000 });

    const date = new Date();
    date.setDate(1);
    date.setFullYear(2020);
    cy.get('input[id="Create Time filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('[data-testid="card"]').should('not.exist');
  });
});
