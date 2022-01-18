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

    cy.get('#search-entities-menu').should('exist');

    cy.get('[aria-label="Submit search"]').should('exist');
    cy.get('[aria-label="Search options"]').should('exist');

    cy.get('#search-entities-menu').click();
    cy.get('[aria-label="Investigation checkbox"]').should('exist');
    cy.get('[aria-label="Dataset checkbox"]').should('exist');
    cy.get('[aria-label="Datafile checkbox"]').should('exist');
  });

  it('should display an error when an invalid start date is entered', () => {
    cy.get('[aria-label="Start date input"]').type('2009-13-01');
    cy.get('.MuiFormHelperText-root').contains('Date format: yyyy-MM-dd.');

    cy.get('[aria-label="Start date input"]').clear();
    cy.get('.MuiFormHelperText-root').should('not.exist');
    cy.get('[aria-label="Start date input"]').type('2009-02-30');
    cy.get('.MuiFormHelperText-root').contains('Date format: yyyy-MM-dd.');
  });

  it('should display an error when an invalid end date is entered', () => {
    cy.get('[aria-label="End date input"]').type('2009-13-01');
    cy.get('.MuiFormHelperText-root').contains('Date format: yyyy-MM-dd.');

    cy.get('[aria-label="End date input"]').clear();
    cy.get('.MuiFormHelperText-root').should('not.exist');
    cy.get('[aria-label="End date input"]').type('2009-02-30');
    cy.get('.MuiFormHelperText-root').contains('Date format: yyyy-MM-dd.');
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

  it('should display advanced help dialogue when advanced button is clicked', () => {
    cy.get('[aria-label="Search options"]').click();

    cy.get('[aria-labelledby="advanced-search-dialog-title"')
      .contains('Advanced Search Tips')
      .should('exist');

    //Should be able to close again
    cy.get('[aria-label="Close"]').click();
    cy.get('[aria-labelledby="advanced-search-dialog-title"')
      .contains('Advanced Search Tips')
      .should('not.exist');

    //Should be able to click on one of the links
    cy.get('[aria-label="Search options"]').click();

    cy.get('[aria-labelledby="advanced-search-dialog-title"').contains(
      'Advanced Search Tips'
    );

    cy.get('[data-testid="advanced-help-link"]').click();
    cy.url().should('contain', '?searchText=neutron+AND+scattering');
  });
});
