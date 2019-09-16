describe('App', () => {
  it('should load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'DataGateway Table');

    cy.contains('datagateway-table').should('be.visible');
  });
});
