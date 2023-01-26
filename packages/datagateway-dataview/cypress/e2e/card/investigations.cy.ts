import { delay } from 'cypress/types/bluebird';

describe('Investigations Cards', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/investigation').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
      { timeout: 15000 }
    );
    cy.get('[aria-label="page view Display as cards"]').click();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('Analysis reflect work or hour color maybe.')
      .click({ force: true });
    cy.location('pathname').should('eq', '/browse/investigation/1/dataset');
  });

  it('should have the correct url for the DOI link', () => {
    cy.get('[data-testid="card"]')
      .first()
      .get('[data-testid="investigation-card-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="card"]')
          .first()
          .get('[data-testid="investigation-card-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  it('should disable the hover tool tip by pressing escape', () => {
    // The hover tool tip has a enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="card"]')
      .get('[data-testid="investigation-card-title"]')
      .first()
      .trigger('mouseover', { force: true })
      .wait(700)
      .get('[role="tooltip"]')
      .should('exist');

    cy.get('body').type('{esc}');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="card"]')
      .get('[data-testid="investigation-card-title"]')
      .wait(700)
      .first()
      .get('[role="tooltip"]')
      .should('not.exist');
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('A air avoid beautiful.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Why news west bar sing tax.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Analysis reflect work or hour color maybe.');
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Analysis reflect work or hour color maybe.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Analysis reflect work or hour color maybe.');
  });

  it('should be able to filter by multiple fields', () => {
    cy.contains('[role="button"]', 'Type ID').click();
    cy.contains('[role="button"]', 'Type ID')
      .parent()
      .contains('[role="button"]', '1')
      .click()
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 30000,
      });
    cy.contains('[role="button"]', 'Type ID - 1').should('exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Address certain professor.');

    cy.get('[data-testid="advanced-filters-link"]').click();

    cy.get('[aria-label="Filter by Title"]')
      .first()
      .type('off', { delay: 20 })
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });

    cy.get('[data-testid="card"]')
      .first()
      .then(($ele) => {
        cy.log($ele.text());
      });

    cy.get('[data-testid="card"]')
      .first()
      .contains('Customer home food important.');

    cy.get('input[id="Start Date filter from"]')
      .click()
      .type('2014-01-01')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('input[aria-label="Start Date filter to"]')
      .parent()
      .find('button')
      .click();
    cy.get('.MuiPickersDay-root[tabindex="-1"]')
      .first()
      .click()
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    const date = new Date();
    date.setDate(1);
    cy.get('input[id="Start Date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('[data-testid="card"]')
      .first()
      .contains('Spend well red behind tough drug.');
  });
});
