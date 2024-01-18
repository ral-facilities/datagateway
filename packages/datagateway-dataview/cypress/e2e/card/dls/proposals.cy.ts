describe('DLS - Proposals Cards', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/proposal?view=card').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
      { timeout: 10000 }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click a proposal to see its visits', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('A air avoid beautiful.')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%2039/investigation'
    );
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[data-testid="advanced-filters-link"]').click();

    cy.get('[aria-label="Filter by Name"]').first().type('2');
    cy.wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]').first().contains('INVESTIGATION 21');
    cy.contains('[aria-label="view-count"]', '15').should('be.visible');

    cy.get('[aria-label="Filter by Title"]').first().type('Dog');
    cy.wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]')
      .first()
      .contains('Majority about dog idea bag summer.');
    cy.get('[data-testid="card"]').should('have.length', 1);
  });
});
