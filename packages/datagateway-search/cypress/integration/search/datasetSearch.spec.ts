describe('Dataset search tab', () => {
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
      .type('police');

    cy.get('[aria-label="submit search button"]').click();

    cy.get('[aria-label="simple tabs example"]')
      .contains('Dataset')
      .click();

    cy.get('[aria-rowcount="15"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 32');
  });

  it.skip('should be able to search by date range', () => {
    // TODO
  });
});
