describe('PageContainer Component', () => {
  it('should not display the open data warning when logged in', () => {
    cy.login({
      username: 'root',
      password: 'pw',
      mechanism: 'simple',
    });
    cy.get('[aria-label="Breadcrumbs"]').should('exist');
    cy.contains('Open data').should('not.exist');
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/browse/investigation/');
    cy.clearDownloadCart();
  });

  it('should display the open data warning when not logged in', () => {
    cy.contains('Open data');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');

    cy.get('[aria-label="Breadcrumbs"]').should('exist');

    cy.contains('Results: ');

    cy.get('[aria-label="Go to search"]').should('exist');

    cy.get('[aria-label="Go to selections"]').should('exist');

    cy.contains('Display as cards');
  });

  it('should display correct entity count', () => {
    // Check that the entity count has displayed correctly.
    cy.contains('Results: 239').should('be.visible');
  });

  it('should display number of items in cart correctly', () => {
    cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
      // matches empty string i.e. no badge
      /^$/
    );

    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains('1');

    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains('2');
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
