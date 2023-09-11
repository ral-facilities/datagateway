describe('Investigations Cards', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/investigation?view=card').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
      { timeout: 15000 }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

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

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('Analysis reflect work or hour color maybe.')
      .click({ force: true });
    cy.location('pathname').should('eq', '/browse/investigation/1/dataset');
  });

  it('should be able to sort by one field or multiple', () => {
    // ascending
    cy.contains('[role="button"]', 'Title').as('titleSortButton').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('A air avoid beautiful.');

    // descending
    cy.get('@titleSortButton').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Why news west bar sing tax.');

    // no order
    cy.get('@titleSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Analysis reflect work or hour color maybe.');

    // multiple fields (shift click)
    cy.contains('[role="button"]', 'Start Date').click();
    cy.get('@titleSortButton').click({ shiftKey: true });
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });

    cy.contains('[aria-label="Sort by TITLE"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by START DATE"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Analysis reflect work or hour color maybe.');

    // should replace current sort if clicked without shift
    cy.contains('[role="button"]', 'Start Date').click();
    cy.wait('@getInvestigationsOrder', { timeout: 10000 });

    cy.contains('[aria-label="Sort by START DATE"]', 'desc').should('exist');
    cy.contains('[aria-label="Sort by TITLE"]', 'asc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Put modern else answer.');
  });

  it('should be able to filter by multiple fields', () => {
    cy.contains('[role="button"]', 'Type ID').click();
    cy.contains('[role="button"]', 'Type ID')
      .parent()
      .contains('[role="button"]', '1')
      .click();
    cy.wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
      timeout: 30000,
    });
    cy.contains('[role="button"]', 'Type ID - 1').should('exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Address certain professor.');

    cy.get('[data-testid="advanced-filters-link"]').click();

    cy.get('[aria-label="Filter by Title"]').first().type('off', { delay: 20 });
    cy.wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
      timeout: 10000,
    });

    cy.get('[data-testid="advanced-filters-link"]').click();

    cy.get('[data-testid="card"]')
      .first()
      .contains('Customer home food important.');

    cy.get('[data-testid="advanced-filters-link"]').click();

    cy.get('input[aria-label="Start Date filter from"]').type('2014-01-01');
    cy.wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
      timeout: 10000,
    });
    cy.get('input[aria-label="Start Date filter to"]')
      .parent()
      .find('button')
      .click();
    cy.get('.MuiPickersDay-root[type="button"]').first().click();
    cy.wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
      timeout: 10000,
    });
    const date = new Date();
    date.setDate(1);
    cy.get('input[aria-label="Start Date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('[data-testid="card"]')
      .first()
      .contains('Spend well red behind tough drug.');
  });
});
