describe('Datasets Cards', () => {
  beforeEach(() => {
    Cypress.currentTest.retries(2);
    cy.server();
    cy.route('**/datasets/count*').as('getDatasetsCount');
    cy.route('**/datasets?order*').as('getDatasetsOrder');
    cy.login('user', 'password');
    cy.visit('/browse/investigation/1/dataset').wait(
      ['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="secondary checkbox"]')
      .click()
      .wait(['@getDatasetsCount', '@getDatasetsCount', '@getDatasetsOrder'], {
        timeout: 10000,
      });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#card').contains('DATASET 1').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/investigation/1/dataset/25/datafile'
    );
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Name')
      .click()
      .wait(['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'], {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('DATASET 1');

    cy.contains('[role="button"]', 'Name')
      .click()
      .wait(['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'], {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('DATASET 241');

    cy.contains('[role="button"]', 'Name')
      .click()
      .wait(['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'], {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('DATASET 1');
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Created Time')
      .click()
      .wait(['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'], {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('DATASET 241');

    cy.contains('[role="button"]', 'Name')
      .click()
      .wait(['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'], {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('DATASET 241');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]')
      .find('input')
      .type('241')
      .wait(['@getDatasetsCount', '@getDatasetsOrder'], { timeout: 10000 });
    cy.get('#card').contains('DATASET 241');

    cy.get('[aria-label="Created Time date filter from"]')
      .type('2019-01-01')
      .wait(['@getDatasetsCount'], { timeout: 10000 });
    cy.get('[aria-label="Created Time date filter to"]')
      .parent()
      .find('button')
      .click();
    cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();
    cy.contains('OK').click().wait(['@getDatasetsCount'], { timeout: 10000 });
    const date = new Date();
    date.setDate(1);
    cy.get('[aria-label="Created Time date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('#card').should('not.exist');
  });
});
