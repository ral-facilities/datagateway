describe('DataGateway HomePage', () => {
  beforeEach(() => {
    cy.visit('/datagateway');
  });

  it('should be able to use links on homepage to navigate', () => {
    //Headings
    cy.get('[aria-label="Browse data"]').click();
    cy.url().should('include', '/browse/investigation');
    cy.go('back');

    cy.get('[aria-label="Search data"]').click();
    cy.url().should('include', '/search');
    cy.go('back');

    cy.get('[aria-label="Search data"]').click();
    cy.url().should('include', '/search');
    cy.go('back');

    cy.get('[aria-label="Download data"]').click();
    cy.url().should('include', '/download');
    cy.go('back');

    cy.get('[aria-label="Read more"]').click();
    cy.url().should('equal', 'https://www.isis.stfc.ac.uk/Pages/About.aspx');
    cy.go('back');
  });
});
