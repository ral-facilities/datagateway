describe('Dataset search tab', () => {
  beforeEach(() => {
    cy.login('user', 'password');

    cy.visit('/search/data/');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('#container-search-filters').should('exist');

    cy.get('#container-search-table').should('exist');
  });

  it('should be able to search by text', () => {
    cy.get('[aria-label="Search text input"]')
      .find('#filled-search')
      .type('police');

    cy.get('[aria-label="Submit search button"]').click();

    cy.get('[aria-label="Search table tabs"]').contains('Dataset').click();

    cy.get('[aria-rowcount="12"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 97');
  });

  it('should be able to search by date range', () => {
    cy.get('[aria-label="Toggle advanced search"]').click();

    cy.get('[aria-label="Start date input"]').type('2003-01-01');
    cy.get('[aria-label="End date input"]').type('2004-01-01');

    cy.get('[aria-label="Submit search button"]').click();

    cy.get('[aria-label="Search table tabs"]').contains('Dataset').click();

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 12');
  });

  it('should be hidden if dataset checkbox is unchecked', () => {
    cy.get('[aria-label="Toggle advanced search"]').click();

    cy.get('[aria-label="Dataset checkbox"]').click();

    cy.get('[aria-label="Submit search button"]').click();

    cy.get('[aria-rowcount="50"]').should('exist');

    cy.get('[aria-label="Search table tabs"]')
      .contains('Dataset')
      .should('not.exist');
  });
});
