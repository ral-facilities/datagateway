describe('App', () => {
  it('should load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'DataGateway DataView');

    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to use links on homepage to navigate', () => {
    cy.visit('/datagateway');

    //Headings
    cy.contains('1. Explore').click();
    cy.url().should('include', '/browse/investigation');
    cy.go('back');

    cy.contains('2. Discover').click();
    cy.url().should('include', '/search');
    cy.go('back');

    cy.contains('3. Download').click();
    cy.url().should('include', '/download');
    cy.go('back');

    //Images
    cy.get('[alt="1. Explore"]').click();
    cy.url().should('include', '/browse/investigation');
    cy.go('back');

    cy.get('[alt="2. Discover"]').click();
    cy.url().should('include', '/search');
    cy.go('back');

    cy.get('[alt="3. Download"]').click();
    cy.url().should('include', '/download');
    cy.go('back');
  });
});
