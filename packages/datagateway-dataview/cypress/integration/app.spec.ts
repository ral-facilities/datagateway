describe('App', () => {
  it('should load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'DataGateway DataView');

    cy.get('#datagateway-dataview').should('be.visible');
  });
});
