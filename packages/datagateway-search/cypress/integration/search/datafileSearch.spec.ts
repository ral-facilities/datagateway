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

    cy.get('[aria-label="Search table tabs"]').contains('Datafile').click();

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 4961');
  });

  it('should be able to search by date range', () => {
    cy.get('[aria-label="start date input"]').type('2012-02-02');
    cy.get('[aria-label="end date input"]').type('2012-02-03');

    cy.get('[aria-label="submit search button"]').click();

    cy.get('[aria-label="Search table tabs"]').contains('Datafile').click();

    cy.get('[aria-rowcount="4"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 120');
  });

  it('should be hidden if dataset checkbox is unchecked', () => {
    cy.get('[aria-label="datafile checkbox"]').click();

    cy.get('[aria-label="submit search button"]').click();

    cy.get('[aria-rowcount="50"]').should('exist');

    cy.get('[aria-label="Search table tabs"]')
      .contains('Datafile')
      .should('not.exist');
  });
});
