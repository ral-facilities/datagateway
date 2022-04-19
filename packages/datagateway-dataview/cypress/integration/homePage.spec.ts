describe('DataGateway HomePage', () => {
  beforeEach(() => {
    cy.visit('/datagateway');
  });

  it('should be able to use links on homepage to navigate', () => {
    //Headings
    cy.get('[data-testid="browse-button"]').click();
    cy.url().should('include', '/browse/investigation');
    cy.go('back');

    cy.get('[data-testid="search-button"]').click();
    cy.url().should('include', '/search');
    cy.go('back');

    cy.get('[data-testid="download-button"]').click();
    cy.url().should('include', '/download');
    cy.go('back');

    cy.get('[data-testid="facility-button"]').click();
    cy.url().should('equal', 'https://www.isis.stfc.ac.uk/Pages/About.aspx');
    cy.go('back');
  });
});
