describe('ISIS - Instruments Cards', () => {
  beforeEach(() => {
    cy.intercept('**/instruments/count*').as('getInstrumentsCount');
    cy.intercept('**/instruments?order*').as('getInstrumentsOrder');
    cy.login();
    cy.visit('/browse/instrument').wait(
      ['@getInstrumentsCount', '@getInstrumentsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="page view Display as cards"]').click();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
  });

  it('should be able to click an instrument to see its facility cycles', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('Eight imagine picture tough.')
      .click({ force: true });
    cy.location('pathname').should('eq', '/browse/instrument/11/facilityCycle');
  });

  it('should be able to expand "More Information"', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('More Information')
      .click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('Eight imagine picture tough.');
    cy.get('#instrument-users-tab').click({ force: true });
    cy.get('[data-testid="card"]')
      .first()
      .get('[aria-label="card-more-information"]')
      .contains('Kim Ramirez');
  });

  it('should be able to sort by one field or multiple', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();
    cy.get('@nameSortButton').click();
    cy.wait('@getInstrumentsOrder', { timeout: 10000 });

    // ascending
    cy.get('@nameSortButton').click();
    cy.wait('@getInstrumentsOrder', { timeout: 10000 });

    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Eight imagine picture tough.');

    // descending
    cy.get('@nameSortButton').click();
    cy.wait('@getInstrumentsOrder', { timeout: 10000 });

    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Whether number computer economy design now serious appear.');

    // no order
    cy.get('@nameSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]')
      .first()
      .contains('Stop prove field onto think suffer measure.');

    cy.contains('[role="button"]', 'Description').click();
    cy.wait('@getInstrumentsOrder', { timeout: 10000 });
    cy.get('[data-testid="card"]')
      .first()
      .contains('Sound low certain challenge yet sport happy.');

    cy.contains('[role="button"]', 'Type').click();
    cy.wait('@getInstrumentsOrder', { timeout: 10000 });
    cy.contains('[aria-label="Sort by DESCRIPTION"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by TYPE"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('10');
  });

  it('should be able to filter by multiple fields', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();
    cy.get('@nameSortButton').click();
    cy.wait('@getInstrumentsOrder', { timeout: 10000 });

    cy.get('[data-testid="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]').first().type('oil');
    cy.wait(['@getInstrumentsCount', '@getInstrumentsOrder'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]')
      .first()
      .contains('Eight imagine picture tough.');

    cy.get('[aria-label="Filter by Type"]').first().type('11');
    cy.wait(['@getInstrumentsCount', '@getInstrumentsOrder'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]').first().contains('11');
  });
});
