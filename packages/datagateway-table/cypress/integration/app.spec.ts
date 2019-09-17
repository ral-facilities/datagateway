describe('App', () => {
  it('should load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'DataGateway Table');

    cy.get('#datagateway-table').should('be.visible');
  });
});
