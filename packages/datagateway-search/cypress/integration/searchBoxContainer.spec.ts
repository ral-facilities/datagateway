describe('SearchBoxContainer Component', () => {
  beforeEach(() => {
    cy.login();

    cy.visit('/search/data/');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('#container-searchbox').should('exist');

    cy.get('[aria-label="Search text input"]').should('exist');

    cy.get('[aria-label="Start date input"]').should('exist');
    cy.get('[aria-label="End date input"]').should('exist');

    cy.get('[aria-label="Investigation checkbox"]').should('exist');
    cy.get('[aria-label="Dataset checkbox"]').should('exist');
    cy.get('[aria-label="Datafile checkbox"]').should('exist');

    cy.get('[aria-label="Submit search"]').should('exist');
  });

  it('should display an error when an invalid start date is entered', () => {
    cy.get('[aria-label="Start date input"]').type('2009-13-01');
    cy.get('.MuiFormHelperText-root').contains('Invalid date');

    cy.get('[aria-label="Start date input"]').clear();
    cy.get('.MuiFormHelperText-root').should('not.exist');
    cy.get('[aria-label="Start date input"]').type('2009-02-30');
    cy.get('.MuiFormHelperText-root').contains('Invalid date');
  });

  it('should display an error when an invalid end date is entered', () => {
    cy.get('[aria-label="End date input"]').type('2009-13-01');
    cy.get('.MuiFormHelperText-root').contains('Invalid date');

    cy.get('[aria-label="End date input"]').clear();
    cy.get('.MuiFormHelperText-root').should('not.exist');
    cy.get('[aria-label="End date input"]').type('2009-02-30');
    cy.get('.MuiFormHelperText-root').contains('Invalid date');
  });

  it('should display an error when the entered end date is before the start date', () => {
    cy.get('[aria-label="Start date input"]').type('2021-10-08');

    cy.get('[aria-label="End date input"]').type('2021-09-01');
    cy.get('.MuiFormHelperText-root').contains('Invalid date range');
  });

  it('should display an error when the entered start date is after the end date', () => {
    cy.get('[aria-label="End date input"]').type('2021-10-08');

    cy.get('[aria-label="Start date input"]').type('2021-11-01');
    cy.get('.MuiFormHelperText-root').contains('Invalid date range');
  });
});
