describe('PageContainer Component', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/investigation/');
    cy.clearDownloadCart();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');

    cy.get('[aria-label="container-breadcrumbs"]').should('exist');

    cy.get('[aria-label="container-view-count"]').should('exist');

    cy.get('[aria-label="container-view-search"]').should('exist');

    cy.get('[aria-label="container-view-cart"]').should('exist');

    cy.get('[aria-label="container-view"]').should('exist');
  });

  it('should display correct entity count', () => {
    // Check that the entity count has displayed correctly.
    cy.get('[aria-label="container-view-count"]')
      .should('be.visible')
      .contains('Results: 239');
  });

  it('should display number of items in cart correctly', () => {
    cy.get('[aria-label="container-view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('be.hidden');

    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="container-view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('1');

    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="container-view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('2');
  });
});
