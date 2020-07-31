describe('SearchBoxContainer Component', () => {
  beforeEach(() => {
    cy.login('user', 'password');

    cy.visit('/search/data/');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('[aria-label="container-searchbox"]').should('exist');

    cy.get('[aria-label="search text input"]').should('exist');

    cy.get('[aria-label="start date input"]').should('exist');
    cy.get('[aria-label="end date input"]').should('exist');

    cy.get('[aria-label="investigation checkbox"]').should('exist');
    cy.get('[aria-label="dataset checkbox"]').should('exist');
    cy.get('[aria-label="datafile checkbox"]').should('exist');

    cy.get('[aria-label="submit search button"]').should('exist');
  });
});
