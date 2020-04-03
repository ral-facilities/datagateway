describe('Datafile search tab', () => {
  beforeEach(() => {
    cy.login('user', 'password');

    cy.visit('/search/data/');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('[aria-label="container-search-filters"]').should('exist');

    cy.get('[aria-label="container-search-table"]').should('exist');
  });

  it('should be able to search by text', () => {
    cy.get('[aria-label="search text input"]')
      .find('#filled-search')
      .type('4961');

    cy.get('[aria-label="submit search button"]').click();

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 4961');
  });

  it('should be able to search by date range', () => {
    // TODO
  });
});
