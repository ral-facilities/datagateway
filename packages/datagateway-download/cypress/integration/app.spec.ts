describe('App', () => {
  it('should load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'DataGateway Download');

    cy.get('#datagateway-download').should('be.visible');
  });
});
