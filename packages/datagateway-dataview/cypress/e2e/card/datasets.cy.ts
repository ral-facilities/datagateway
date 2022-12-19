describe('Datasets Cards', () => {
  beforeEach(() => {
    cy.intercept('**/datasets/count*').as('getDatasetsCount');
    cy.intercept('**/datasets?order*').as('getDatasetsOrder');
    cy.login();
    cy.visit('/browse/investigation/1/dataset').wait(
      ['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="page view Display as cards"]')
      .click()
      .wait(['@getDatasetsOrder'], {
        timeout: 10000,
      });
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

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Name').click().wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 1');

    cy.contains('[role="button"]', 'Name').click().wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 241');

    cy.contains('[role="button"]', 'Name').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 1');
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Create Time')
      .click()
      .wait('@getDatasetsOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 1');

    cy.contains('[role="button"]', 'Name').click().wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('DATASET 1');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[data-testid="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]')
      .first()
      .type('241')
      .wait(['@getDatasetsCount', '@getDatasetsOrder'], { timeout: 10000 });
    cy.get('[data-testid="card"]').first().contains('DATASET 241');

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
