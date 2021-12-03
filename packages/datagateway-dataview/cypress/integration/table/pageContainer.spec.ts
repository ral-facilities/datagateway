describe('PageContainer Component', () => {
  it('should not display the open data warning when logged in', () => {
    cy.login({
      username: 'root',
      password: 'pw',
      mechanism: 'simple',
    });
    cy.get('[aria-label="page-breadcrumbs"]').should('exist');
    cy.get('[aria-label="open-data-warning"]').should('not.exist');
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/browse/investigation/');
    cy.clearDownloadCart();
  });

  it('should display the open data warning when not logged in', () => {
    cy.get('[aria-label="open-data-warning"]').should('exist');
  });

  it('should disable the hover tool tip by pressing escape (open data warning)', () => {
    // The hover tool tip has a enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="open-data-warning"]')
      .first()
      .trigger('mouseover')
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('exist');

    cy.get('body').type('{esc}');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="open-data-warning"]')
      .wait(700)
      .first()
      .get('[data-testid="arrow-tooltip-component-false"]')
      .first()
      .should('exist');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');

    cy.get('[aria-label="page-breadcrumbs"]').should('exist');

    cy.get('[aria-label="view-count"]').should('exist');

    cy.get('[aria-label="view-search"]').should('exist');

    cy.get('[aria-label="view-cart"]').should('exist');

    cy.get('[aria-label="page-view Display as cards"]').should('exist');
  });

  it('should display correct entity count', () => {
    // Check that the entity count has displayed correctly.
    cy.get('[aria-label="view-count"]')
      .should('be.visible')
      .contains('Results: 239');
  });

  it('should display number of items in cart correctly', () => {
    cy.get('[aria-label="view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('be.hidden');

    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('1');

    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('2');
  });

  it('should display selection alert banner correctly', () => {
    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'not.exist'
    );

    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'exist'
    );
    cy.get('[aria-label="selection-alert-text"]')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal('1 item has been added to selections.');
      });
    cy.get('[aria-label="selection-alert-close"]').click();
    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'not.exist'
    );
  });
});
