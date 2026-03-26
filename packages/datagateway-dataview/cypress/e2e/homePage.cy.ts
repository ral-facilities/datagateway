describe('DataGateway HomePage', () => {
  beforeEach(() => {
    cy.visit('/datagateway');
  });

  it('should be able to use links on homepage to navigate', () => {
    //Headings
    cy.get('[data-testid="browse-button"]').click();
    cy.url().should('include', '/browse/investigation');

    cy.visit('/datagateway');
    cy.get('[data-testid="search-button"]').click();
    cy.url().should('include', '/search');

    cy.visit('/datagateway');
    cy.get('[data-testid="download-button"]').click();
    cy.url().should('include', '/download');

    cy.visit('/datagateway');
    cy.origin('https://www.isis.stfc.ac.uk/about/', () => {
      cy.on('uncaught:exception', (_e) => {
        return false;
      });
    });
    cy.get('[data-testid="facility-button"]').click();
    cy.url().should('equal', 'https://www.isis.stfc.ac.uk/about/');
  });
});
