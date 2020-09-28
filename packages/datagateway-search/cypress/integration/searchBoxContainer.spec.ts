describe('SearchBoxContainer Component', () => {
  beforeEach(() => {
    cy.login('user', 'password');

    cy.visit('/search/data/');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('#container-searchbox').should('exist');

    cy.get('[aria-label="Search text input"]').should('exist');

    cy.get('[aria-label="Start date input"]').should('not.exist');
    cy.get('[aria-label="End date input"]').should('not.exist');

    cy.get('[aria-label="Investigation checkbox"]').should('not.exist');
    cy.get('[aria-label="Dataset checkbox"]').should('not.exist');
    cy.get('[aria-label="Datafile checkbox"]').should('not.exist');

    cy.get('[aria-label="Submit search button"]').should('exist');
    cy.get('[aria-label="Toggle advanced search"]').should('exist');
  });

  it('display advanced search settings on toggle', () => {
    cy.get('[aria-label="Toggle advanced search"]').click();

    cy.get('[aria-label="Start date input"]').should('exist');
    cy.get('[aria-label="End date input"]').should('exist');
    cy.get('[aria-label="Investigation checkbox"]').should('exist');
    cy.get('[aria-label="Dataset checkbox"]').should('exist');
    cy.get('[aria-label="Datafile checkbox"]').should('exist');

    cy.get('[aria-label="Toggle advanced search"]').click();

    cy.get('[aria-label="Start date input"]').should('not.exist');
    cy.get('[aria-label="End date input"]').should('not.exist');
    cy.get('[aria-label="Investigation checkbox"]').should('not.exist');
    cy.get('[aria-label="Dataset checkbox"]').should('not.exist');
    cy.get('[aria-label="Datafile checkbox"]').should('not.exist');
  });
});
