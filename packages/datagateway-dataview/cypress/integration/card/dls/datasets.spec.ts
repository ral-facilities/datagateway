describe('DLS - Datasets Cards', () => {
  beforeEach(() => {
    cy.intercept('**/datasets/count*').as('getDatasetsCount');
    cy.intercept('**/datasets?order*').as('getDatasetsOrder');
    cy.login();
    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/1/dataset').wait(
      ['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'],
      {
        timeout: 10000,
      }
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

    //Default sort
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('DATASET 241')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/241/datafile'
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
      .contains('DATASET 241');
    cy.get('#calculate-size-btn').click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('6.46 GB', { timeout: 10000 });

    cy.get('#dataset-type-tab').click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('DATASETTYPE 2');
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

    it('multiple fields', () => {
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
        .type('241')
        .wait(['@getDatasetsCount', '@getDatasetsOrder'], { timeout: 10000 });
      cy.get('[data-testid="card"]').first().contains('DATASET 241');

      cy.get('input[id="Create Time filter from"]')
        .type('2019-01-01')
        .wait(['@getDatasetsCount'], { timeout: 10000 });
      cy.get('button[aria-label="Create Time filter to, date picker"]')
        .parent()
        .find('button')
        .click();
      cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();
      cy.contains('OK').click().wait(['@getDatasetsCount'], { timeout: 10000 });
      const date = new Date();
      date.setDate(1);
      cy.get('input[id="Create Time filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );
      cy.get('[data-testid="card"]').should('not.exist');
    });
  });

  it('should display correct datafile count after filtering', () => {
    cy.visit('/browse/proposal/INVESTIGATION%202/investigation/2/dataset').wait(
      ['@getDatasetsCount', '@getDatasetsOrder'],
      {
        timeout: 10000,
      }
    );
    //Revert the default sort
    cy.contains('[role="button"]', 'Create Time')
      .click()
      .wait('@getDatasetsOrder', { timeout: 10000 });

    cy.get('[data-testid="advanced-filters-link"]').click();

    cy.get('[aria-label="Filter by Name"]')
      .first()
      .type('DATASET 242')
      .wait(['@getDatasetsCount', '@getDatasetsOrder'], { timeout: 10000 });

    cy.get('[data-testid="card"]').first().contains('55');
  });
});
