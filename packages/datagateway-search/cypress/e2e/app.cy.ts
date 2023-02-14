describe('App', () => {
  it('should load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'DataGateway Search');

    cy.get('#datagateway-search').should('be.visible');
  });
});
