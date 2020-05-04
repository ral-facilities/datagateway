describe('Investigation search tab', () => {
  beforeEach(() => {
    cy.login('user', 'password');

    cy.visit('/search/data/');

    cy.get('[aria-label="submit search button"]').click();

    cy.get('[aria-label="simple tabs example"]')
      .contains('Investigation')
      .click();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('[aria-label="container-search-filters"]').should('exist');

    cy.get('[aria-label="container-search-table"]').should('exist');
  });

  it('should be able to search by title text', () => {
    cy.get('[aria-label="search text input"]')
      .find('#filled-search')
      .type('dog');

    cy.get('[aria-label="submit search button"]').click();

    cy.get('[aria-rowcount="4"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="5"]').contains(
      'INVESTIGATION 17'
    );
  });

  it('should be able to search by instrument text', () => {
    cy.get('[aria-label="search text input"]')
      .find('#filled-search')
      .type('knowledge media');

    cy.get('[aria-label="submit search button"]').click();

    cy.get('[aria-rowcount="32"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="5"]').contains(
      'INVESTIGATION 30'
    );
  });

  it('should be able to search by date range', () => {
    cy.get('[aria-label="start date input"]').type('2001-01-01');
    cy.get('[aria-label="end date input"]').type('2001-12-31');

    cy.get('[aria-label="submit search button"]').click();

    cy.get('[aria-rowcount="12"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="5"]').contains(
      'INVESTIGATION 4'
    );
  });
});
