describe('Datasets Cards', () => {
  beforeEach(() => {
    cy.intercept('**/datasets/count*').as('getDatasetsCount');
    cy.intercept('**/datasets?order*').as('getDatasetsOrder');
    cy.login();
    cy.visit('/browse/investigation/1/dataset?view=card').wait(
      ['@getDatasetsCount', '@getDatasetsOrder'],
      { timeout: 10000 }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('DATASET 1')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/investigation/1/dataset/1/datafile'
    );
  });

  it('should be able to sort by one field or multiple', () => {
    // ascending
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();
    cy.wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 1');

    // descending
    cy.get('@nameSortButton').click();
    cy.wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 61');

    // no order
    cy.get('@nameSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 1');

    // multiple fields (shift click)
    cy.contains('[role="button"]', 'Create Time').click();
    cy.wait('@getDatasetsOrder', {
      timeout: 10000,
    });

    cy.get('@nameSortButton').click({ shiftKey: true });
    cy.wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[aria-label="Sort by NAME"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by CREATE TIME"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');

    cy.get('[data-testid="card"]').first().contains('DATASET 1');

    // should replace current sort if clicked without shift
    cy.get('@nameSortButton').click();

    cy.contains('[aria-label="Sort by NAME"]', 'desc').should('exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.contains('[aria-label="Sort by CREATE TIME"]', 'asc').should(
      'not.exist'
    );

    cy.get('[data-testid="card"]').first().contains('DATASET 61');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[data-testid="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]').first().type('61');
    cy.wait(['@getDatasetsCount', '@getDatasetsOrder'], { timeout: 10000 });
    cy.get('[data-testid="card"]').first().contains('DATASET 61');

    cy.get('input[id="Create Time filter from"]').type('2019-01-01');
    cy.wait(['@getDatasetsCount'], { timeout: 10000 });
    cy.get('[data-testid="card"]').first().contains('DATASET 61');

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
