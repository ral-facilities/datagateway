describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/investigation');
  });

  it('should load correctly and display current breadcrumb', () => {
    cy.title().should('equal', 'DataGateway Table');

    cy.contains('Investigations');
  });
});
