describe('PageContainer Component', () => {
  beforeEach(() => {
    cy.login('user', 'password');

    cy.visit('/browse/investigation/');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');

    cy.get('[aria-label="container-breadcrumbs"]').should('exist');

    cy.get('[aria-label="container-table-count"]').should('exist');

    cy.get('[aria-label="container-table-cart"]').should('exist');

    cy.get('[aria-label="container-table"]').should('exist');
  });

  it('should display correct entity count', () => {
    // Check that the entity count has displayed correctly.
    cy.get('[aria-label="container-table-count"]')
      .should('be.visible')
      .contains('Results: 239');
  });

  it('should display number of items in cart correctly', () => {
    // Check that the download cart has displayed correctly.
    cy.get('[aria-label="container-table-cart"]').should('be.visible');

    cy.get('[aria-label="container-table-cart-badge"]')
      .should('be.visible')
      .contains('1');

    cy.get('[aria-label="select row 1"]').check();

    cy.get('[aria-label="container-table-cart-badge"]')
      .should('be.visible')
      .contains('2');
  });
});
