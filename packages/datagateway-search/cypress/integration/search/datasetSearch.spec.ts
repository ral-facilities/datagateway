describe('Dataset search tab', () => {
  beforeEach(() => {
    cy.login('user', 'password');

    cy.visit('/search/data/');

    cy.get('[aria-label="submit search button"]').click();

    cy.get('[aria-label="simple tabs example"]')
      .contains('Dataset')
      .click();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('[aria-label="container-search-filters"]').should('exist');

    cy.get('[aria-label="container-search-table"]').should('exist');
  });

  it('should be able to search by text', () => {
    // TODO
  });

  it('should be able to search by date range', () => {
    // TODO
  });
});
