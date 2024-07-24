describe('DLS - Proposals Table', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('**/investigations?*').as('investigations');
    cy.intercept('**/investigations/count?*').as('investigationsCount');
    cy.visit('/browse/proposal');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click a proposal to see its investigations', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%2039/investigation'
    );
  });

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="59"]').should('exist');
  });

  it('should be able to filter', () => {
    cy.wait(['@investigations', '@investigationsCount'], { timeout: 10000 });

    cy.get('[aria-label="Filter by Name"]').first().type('2');

    cy.get('[aria-rowcount="15"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      'INVESTIGATION 21'
    );

    cy.get('[aria-label="Filter by Title"]').first().type('dog');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      'INVESTIGATION 52'
    );
  });
});
