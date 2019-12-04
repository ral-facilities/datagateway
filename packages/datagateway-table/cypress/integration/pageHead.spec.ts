describe('PageHead Component', () => {
  beforeEach(() => {
    cy.login('user', 'password');

    cy.visit('/browse/investigation/');
  });

  it('should load correctly and display correct entity count', () => {
    cy.title().should('equal', 'DataGateway Table');

    // Check that the entity count has displayed correctly.
    cy.get('[aria-label="head-entity-count"]')
      .should('be.visible')
      .contains('Results: 239');
  });
});
